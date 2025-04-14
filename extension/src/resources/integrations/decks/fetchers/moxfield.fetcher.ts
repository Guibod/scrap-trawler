import AbstractDeckFetcher, { type CardDboBoard } from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { CardNameAndQuantity, DeckBoards, DeckDescription } from "~/resources/storage/entities/event.entity"
import type SettingsService from "~/resources/domain/services/settings.service"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { FetchRequest, FetchResponse } from "~/background/messages/fetch/fetch"
import { getLogger } from "~/resources/logging/logger"
import { MtgJsonFormats } from "~/resources/integrations/mtg-json/types"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { type LegalityBoard, type LegalityBoards } from "~/resources/integrations/mtg-json/legality"
import { sendToBackground } from "@plasmohq/messaging"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"
import { resolveEnumValue } from "~/resources/utils/enum"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"

const logger = getLogger("fetcher-moxfield")

const MoxfieldFormats : Record<string, MTG_FORMATS> = {
  "commander": MTG_FORMATS.COMMANDER,
  "commanderPrecons": MTG_FORMATS.COMMANDER,
  "standard": MTG_FORMATS.STANDARD,
  "pauper": MTG_FORMATS.PAUPER,
  "pioneer": MTG_FORMATS.PIONEER,
  "modern": MTG_FORMATS.MODERN,
  "legacy": MTG_FORMATS.LEGACY,
  "vintage": MTG_FORMATS.VINTAGE,
  "duelCommander": MTG_FORMATS.DUEL,
  "oathbreaker": MTG_FORMATS.OATHBREAKER,
}

type RawBoard = {
  count: number
  cards: Record<string, MoxfieldCard>
}

type RawBoards = Record<keyof CardDboBoard, RawBoard>

type RawPayload = {
  publicId: string
  name: string
  lastUpdatedAtUtc: string
  colorIdentity: string[]
  format: string
  boards: RawBoards
}

type MoxfieldCard = {
  quantity: number
  card: {
    name: string,
    legalities: Record<typeof MtgJsonFormats[keyof typeof MtgJsonFormats], 'legal' | 'not_legal' | 'restricted' | 'banned'>,
    color_identity: string[]
  }
}

// noinspection ExceptionCaughtLocallyJS
export class MoxfieldFetcher extends AbstractDeckFetcher<RawPayload> {
  public static readonly API_URL = "https://scrap-trawler-proxy.guibod12.workers.dev/moxfield";
  public static readonly DELAY = 3000

  constructor(
    settingsService: SettingsService,
    cardService: CardService,
    eventService: EventService
  ) {
    super(settingsService, cardService, eventService);
  }

  async applyThrottle(): Promise<this> {
    await new Promise((resolve) => setTimeout(
      resolve,
      MoxfieldFetcher.DELAY
    ));
    return this
  }

  static async generateId(row: SpreadsheetRow): Promise<string> {
    return `moxfield:${MoxfieldFetcher.extractDeckId(row.decklistUrl)}`;
  }

  async run(request: DeckFetchRequest): Promise<DeckFetchResponse> {
    const id = MoxfieldFetcher.extractDeckId(request.row.decklistUrl);
    let raw = undefined

    try {
      const response = await sendToBackground<FetchRequest, FetchResponse>({
        name: "fetch/fetch",
        body: {
          url: `${MoxfieldFetcher.API_URL}/${id}`
        }
      })
      if (!response.ok) {
        logger.warn(`Failed to fetch deck ${id} with ${response.error}`)
        throw new Error(`Failed to fetch deck ${id}`)
      }

      return {
        request,
        deck: await this.parse(response.data, request),
        rawData: response.data,
        success: true
      };
    } catch (e) {
      logger.error(`Failed to fetch deck ${request.row.decklistUrl}`)
      logger.exception(e)
      return {
        request,
        deck: null,
        errorMessage: e.message,
        rawData: raw,
        success: false,
      }
    }
  }

  async parse(raw: any, request: DeckFetchRequest, format: MTG_FORMATS = null, archetypeHint: string = null): Promise<DeckDescription> {
    this.parseSetup(raw)

    const faceCard = raw.main?.name || null;
    let archetype = archetypeHint ?? null;

    if (!format) {
      format = MoxfieldFormats[raw['format']] ?? null;
    }

    if ([MTG_FORMATS.COMMANDER, MTG_FORMATS.DUEL, MTG_FORMATS.OATHBREAKER].includes(format)) {
      const archetypeCards = { ...raw.boards.commanders.cards, ...raw.boards.signatureSpells.cards, ...raw.boards.companions.cards }
      archetype = Object.values(archetypeCards).map((card: MoxfieldCard) => card.card.name).sort().join(" / ")
    }

    this.boards = this.toDeckBoards(raw.boards)

    return this.describe({
      id: raw.publicId,
      name: raw.name,
      source: DeckSource.MOXFIELD,
      lastUpdated: raw.lastUpdatedAtUtc ?? null,
      url: raw.publicUrl,
      face: faceCard,
      colors: raw.colorIdentity.map(c => resolveEnumValue(MTG_COLORS, c)),
      archetype,
      format
    })
  }

  private static extractDeckId(url: string): string {
    const match = url?.match(/moxfield\.com\/decks\/([^/?#]+)/);
    if (!match || !match[1]) throw new Error("Invalid Moxfield deck URL");
    return match[1];
  }

  /**
   * Moxfield provides everything required to check the deck validity without the need of the database
   * @protected
   */
  protected async buildLegalityBoards(): Promise<LegalityBoards> {
    const mapToLegalityBoard = (board: RawBoard): LegalityBoard => ({
      count: board?.count,
      cards: Object.values(board?.cards ?? []).map(card => ({
        quantity: card.quantity,
        card: {
          name: card.card.name,
          legalities: card.card.legalities,
          colorIdentity: card.card.color_identity
        }
      }))
    })

    return {
      mainboard: mapToLegalityBoard(this.raw.boards?.mainboard),
      sideboard: mapToLegalityBoard(this.raw.boards?.sideboard),
      commanders: mapToLegalityBoard(this.raw.boards?.commanders),
      companions: mapToLegalityBoard(this.raw.boards?.companions),
      signatureSpells: mapToLegalityBoard(this.raw.boards?.signatureSpells),
    }
  }

  protected toDeckBoards(raw: RawBoards): DeckBoards {
    const transform = (board: RawBoard): CardNameAndQuantity[] =>
      Object.values(board.cards).map(({ quantity, card }) => ({ quantity, name: card.name }))

    return {
      mainboard: transform(raw.mainboard),
      sideboard: transform(raw.sideboard),
      commanders: transform(raw.commanders),
      companions: transform(raw.companions),
      signatureSpells: transform(raw.signatureSpells),
    }
  }
}