import AbstractDeckFetcher from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type SettingsService from "~/resources/domain/services/settings.service"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { type DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type { DeckDescription } from "~/resources/storage/entities/event.entity"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"

export const DUMMY_RAW_DATA = { dummy: true}

export class InstantDummyFetcher extends AbstractDeckFetcher {
  constructor(
    settingsService: SettingsService,
    cardService: CardService,
    eventService: EventService
  ) {
    super(settingsService, cardService, eventService)
  }
  static async generateId(row: SpreadsheetRow) { return `dummy-instant:${row.id}` }
  async applyThrottle() { return this }
  async run(request: DeckFetchRequest): Promise<DeckFetchResponse> {
    return {
      success: true,
      request,
      deck: await this.parse(request.row.decklistUrl),
      rawData: DUMMY_RAW_DATA
    }
  }
  async parse(raw: any): Promise<DeckDescription> {
    return {
      id: `remote-id-for-${raw}`,
      archetype: 'TestArchetype',
      url: 'https://example.com',
      face: 'Forest',
      source: DeckSource.UNKNOWN,
      lastUpdated: new Date().toISOString(),
      boards: {
        mainboard: [{ quantity: 1, name: 'Forest' }],
      },
      format: MTG_FORMATS.COMMANDER,
      legal: true,
      colors: [MTG_COLORS.GREEN],
      name: 'TestDeck'
    }
  }
}

export class SlowDummyFetcher extends InstantDummyFetcher {
  static async generateId(row: SpreadsheetRow) { return `dummy-slow:${row.id}` }
  async applyThrottle() {
    await new Promise(resolve => setTimeout(resolve, 50))
    return this
  }
}