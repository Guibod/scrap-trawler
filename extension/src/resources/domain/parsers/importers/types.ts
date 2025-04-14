import type {
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata,
  SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"


export type SheetTab = {
  id: string              // sheetId
  title: string           // user-facing title
  index: number           // order in the UI
  hidden: boolean         // hidden status
  rowCount: number        // grid height
  columnCount: number     // grid width
}

export type SpreadsheetImportRequest = {
  metadata: Partial<SpreadsheetMetadata>
  event?: EventModel
  file?: File
}

export type KnownIdentities = {
  firstNames: Set<string>
  lastNames: Set<string>
}

export type ImportedData = { columns: SpreadsheetColumnMetaData[]; rows: SpreadsheetRawData }
