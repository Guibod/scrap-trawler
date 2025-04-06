import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type SettingsService from "~/resources/domain/services/settings.service"
import { NotYetImplemented } from "~/resources/exception"
import type { CardNameAndQuantity, DeckBoards, DeckDescription } from "~/resources/storage/entities/event.entity"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { checkLegality, type LegalityBoard, type LegalityBoards } from "~/resources/integrations/mtg-json/legality"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { DeckMapper } from "~/resources/domain/mappers/deck.mapper"

export type CardDboAndQuantity = {
  quantity: number,
  card: CardDbo
}

export type CardDboBoard = {
  mainboard: CardDboAndQuantity[],
  sideboard: CardDboAndQuantity[],
  commanders: CardDboAndQuantity[],
  companions: CardDboAndQuantity[],
  signatureSpells: CardDboAndQuantity[],
}

export interface DeckFetcher {
  new (settingsService: SettingsService, cardService: CardService, eventService: EventService): AbstractDeckFetcher<any>;
  generateId: (row: SpreadsheetRow) => Promise<string>;
}

export default abstract class AbstractDeckFetcher<T> {
  protected colorIdentity = new Set<MTG_COLORS>()
  protected boards: DeckBoards = {
    mainboard: [],
    sideboard: [],
    commanders: [],
    companions: [],
    signatureSpells: [],
  }
  protected raw: T

  protected constructor(
    protected readonly settingsService: SettingsService,
    protected readonly cardService: CardService,
    protected readonly eventService: EventService
  ) {}

  abstract run(row: DeckFetchRequest): Promise<DeckFetchResponse>;
  abstract parse(raw: string | object, request: DeckFetchRequest): Promise<DeckDescription>

  protected parseSetup(raw: T) {
    this.raw = raw
    this.colorIdentity = new Set()
    this.boards = {
      mainboard: [],
      sideboard: [],
      commanders: [],
      companions: [],
      signatureSpells: [],
    }
  }

  static async generateId(row: SpreadsheetRow): Promise<string> {
    throw new NotYetImplemented("generateId() is not yet implemented");
  }

  async applyThrottle(): Promise<this> {
    return new Promise(resolve => setTimeout(resolve, 1000)).then(() => this);
  }

  protected async buildLegalityBoards(): Promise<LegalityBoards> {
    const resolved = await (new DeckMapper(this.cardService)).toResolvedBoards(this.boards)

    const mapToLegalityBoard = (arr: CardDboAndQuantity[]): LegalityBoard => {
      // We update the color identity since we have access to the whole card
      arr.forEach(card => card.card.colorIdentity?.forEach(c => this.colorIdentity.add(c as MTG_COLORS)))

      return {
        count: arr.reduce((acc, card) => acc + card.quantity, 0),
          cards: arr.map(card => ({
        quantity: card.quantity,
        card: {
          name: card.card.name,
          legalities: card.card.legalities,
          colorIdentity: card.card.colorIdentity
        }
      }))
      }
    }

    return {
      mainboard: mapToLegalityBoard(resolved.mainboard ?? []),
      sideboard: mapToLegalityBoard(resolved.sideboard ?? []),
      commanders: mapToLegalityBoard(resolved.commanders ?? []),
      companions: mapToLegalityBoard(resolved.companions ?? []),
      signatureSpells: mapToLegalityBoard(resolved.signatureSpells ?? []),
    }
  }

  protected addToBoard(card: CardNameAndQuantity, target: keyof CardDboBoard): void {
    const name = this.sanitizeString(card.name)
    const board = this.boards[target]

    const existing = board.find(c => c.name === name)
    if (existing) {
      existing.quantity += card.quantity
    } else {
      board.push({ name, quantity: card.quantity })
    }
  }

  protected sanitizeString(str: string): string {
    return str.trim()
  }

  protected async describe(description: Partial<DeckDescription> & Pick<DeckDescription, 'id' | 'format'>): Promise<DeckDescription> {
    return {
      url: null,
      name: null,
      source: DeckSource.UNKNOWN,
      archetype: null,
      face: this.boards.commanders[0]?.name || this.boards.mainboard[0]?.name || null,
      lastUpdated: null,
      boards: this.boards,
      legal: checkLegality(await this.buildLegalityBoards(), description.format),
      colors: [...this.colorIdentity],
      ...description
    }
  }
}
