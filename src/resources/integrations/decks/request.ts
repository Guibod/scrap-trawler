import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { UnresolvedFetcherError } from "~/resources/integrations/decks/exceptions"
import type { DeckFetcher } from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { DeckDescription } from "~/resources/storage/entities/event.entity"
import DeckFetcherResolver from "~/resources/integrations/decks/resolver"
import type { EventModel } from "~/resources/domain/models/event.model"

export class DeckFetchRequest {
  public readonly id: string;
  public readonly fetcherType: DeckFetcher;

  constructor(
    public readonly eventId: string,
    public readonly row: SpreadsheetRow
  ) {
    this.id = crypto.randomUUID();
    const fetcherType = DeckFetcherResolver.resolveFetcherType(row);

    if (!fetcherType) {
      throw new UnresolvedFetcherError(`No valid fetcher found for row: ${JSON.stringify(row)}`);
    }

    this.fetcherType = fetcherType
  }

  /**
   * Create DeckFetchRequest from an mapped spreadsheet rows
   * @param event
   */
  static fromEvent(event: EventModel) {
    return Object.values(event.mapping)
      .map(entry => {
        const row = event.spreadsheet.data.find(row => row.id === entry.rowId)
        if (!row) return null
        return new DeckFetchRequest(event.id, row)
      })
      .filter(request => !!request)
  }

  static fromRows(eventId: string, rows: SpreadsheetRow[]) {
    return rows
      .map(row => new DeckFetchRequest(eventId, row))
  }
}


export class DeckFetchResponse {
  request: DeckFetchRequest
  deck: DeckDescription | null
  rawData?: any
  errorMessage?: string;
  success: boolean
}