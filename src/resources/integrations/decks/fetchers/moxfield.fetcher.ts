import AbstractDeckFetcher from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { CardNameAndQuantity, DeckDescription } from "~/resources/storage/entities/event.entity"
import type SettingsService from "~/resources/domain/services/settings.service"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { FetchRequest, FetchResponse } from "~/background/messages/fetch/fetch"
import { getLogger } from "~/resources/logging/logger"
import { MtgJsonFormats } from "~/resources/integrations/mtg-json/types"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { checkLegality, type LegalityBoard } from "~/resources/integrations/mtg-json/legality"
import { resolveEnumValue } from "~/resources/utils/enum"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { sendToBackground } from "@plasmohq/messaging"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"

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

type MoxfieldCard = {
  quantity: number
  card: {
    name: string,
    legalities: Record<typeof MtgJsonFormats[keyof typeof MtgJsonFormats], 'legal' | 'not_legal' | 'restricted' | 'banned'>,
    color_identity: string[]
  }
}

// noinspection ExceptionCaughtLocallyJS
export class MoxfieldFetcher extends AbstractDeckFetcher {
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
        deck: await this.parse(response.data),
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
  async parse(raw: any, format: MTG_FORMATS = null, archetypeHint: string = null): Promise<DeckDescription> {
    const faceCard = raw.main?.name || null;
    let archetype = archetypeHint ?? null;

    if (!format) {
      format = MoxfieldFormats[raw['format']] ?? null;
    }

    if ([MTG_FORMATS.COMMANDER, MTG_FORMATS.DUEL, MTG_FORMATS.OATHBREAKER].includes(format)) {
      const archetypeCards = { ...raw.boards.commanders.cards, ...raw.boards.signatureSpells.cards, ...raw.boards.companions.cards }
      archetype = Object.values(archetypeCards).map((card: MoxfieldCard) => card.card.name).sort().join(" / ")
    }

    return {
      id: raw.publicId,
      archetype,
      name: raw.name,
      url: raw.publicUrl,
      source: DeckSource.MOXFIELD,
      lastUpdated: raw.lastUpdatedAtUtc ?? null,
      boards: this.buildBoards(raw.boards, this.extractCardNamesAndQuantities),
      face: faceCard,
      legal: checkLegality(
        this.buildBoards(raw.boards, this.extractLegalityCardAndQuantities),
        format
      ),
      format: format,
      colors: raw.colorIdentity?.map(c => resolveEnumValue(MTG_COLORS, c)) ?? [],
    };
  }

  private static extractDeckId(url: string): string {
    const match = url?.match(/moxfield\.com\/decks\/([^/?#]+)/);
    if (!match || !match[1]) throw new Error("Invalid Moxfield deck URL");
    return match[1];
  }

  private buildBoards<T>(boards: any, callback: (cardMap: Record<string, MoxfieldCard>) => T):
    Record<'mainboard' | 'sideboard' | 'commanders' | 'companions' | 'signatureSpells', T> {

    return {
      mainboard: callback(boards.mainboard?.cards ?? {}),
      sideboard: callback(boards.sideboard?.cards ?? {}),
      commanders: callback(boards.commanders?.cards ?? {}),
      companions: callback(boards.companions?.cards ?? {}),
      signatureSpells: callback(boards.signatureSpells?.cards ?? {}),
    }
  }

  private extractCardNamesAndQuantities(obj: Record<string, MoxfieldCard>): CardNameAndQuantity[] {
    return Object.values(obj).map(card => ({
      name: card.card.name,
      quantity: card.quantity
    }));
  }

  private extractLegalityCardAndQuantities(obj: Record<string, MoxfieldCard>): LegalityBoard {
    return {
      count: Object.values(obj).reduce((acc, card) => acc + card.quantity, 0),
      cards: Object.values(obj).map(card => ({
        quantity: card.quantity,
        card: {
          name: card.card.name,
          legalities: card.card.legalities,
          colorIdentity: card.card.color_identity
        }
      }))
    }
  }
}