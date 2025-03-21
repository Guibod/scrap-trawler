import AbstractDeckFetcher from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type SettingsService from "~/resources/domain/services/settings.service"
import type { DeckDescription } from "~/resources/storage/entities/event.entity"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { UnresolvedFetcherError } from "~/resources/integrations/decks/exceptions"

export class NothingFetcher extends AbstractDeckFetcher {
  constructor(
    settingsService: SettingsService,
    cardService: CardService,
    eventService: EventService
  ) {
    super(settingsService, cardService, eventService)
  }

  public async run(request: DeckFetchRequest): Promise<DeckFetchResponse> {
    return {
      request,
      deck: null,
      rawData: request.row.decklistUrl,
      errorMessage: 'No fetcher for this row',
      success: false
    }
  }

  public async parse(): Promise<DeckDescription> {
    throw new UnresolvedFetcherError('No fetcher for this row')
  }

  static async generateId(row: SpreadsheetRow): Promise<string> {
    const hash = row.decklistUrl.trim()
    return `nothing:${hash}`
  }

  async applyThrottle(): Promise<this> {
    return this
  }
}
