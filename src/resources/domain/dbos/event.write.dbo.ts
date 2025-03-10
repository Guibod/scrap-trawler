import type { WotcExtractedEvent } from "~/resources/integrations/eventlink/event-extractor"
import type {
  SpreadsheetRawRow,
} from "~/resources/domain/dbos/spreadsheet.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"

export type EventWriteDbo = Partial<EventModel> & {
  id?: string,
  raw_data: {
    wotc: WotcExtractedEvent,
    spreadsheet?: SpreadsheetRawRow[]
    [key: string]: any
  }
}

/**
 * Type guard to check if an object conforms to the `EventWriteDbo` type.
 * Ensures the presence of `raw_data` with a `wotc` field and optionally `spreadsheet`.
 *
 * @param obj - The object to validate.
 * @returns {obj is EventWriteDbo} - `true` if the object matches the type, otherwise `false`.
 */
export function isEventWriteDbo(obj: any): obj is EventWriteDbo {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "raw_data" in obj &&
    typeof obj.raw_data === "object" &&
    obj.raw_data !== null &&
    "wotc" in obj.raw_data &&
    typeof obj.raw_data.wotc === "object"
  );
}
