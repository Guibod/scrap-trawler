import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import type {
  RawSpreadsheetRow,
} from "~resources/domain/dbos/spreadsheet.dbo"
import type { EventModel } from "~resources/domain/models/event.model"

export type EventWriteDbo = Partial<EventModel> & {
  raw_data: {
    wotc: WotcExtractedEvent,
    spreadsheet?: RawSpreadsheetRow[]
    [key: string]: any
  }
}
