import { type COLUMN_TYPE, DUPLICATE_HANDLING_STRATEGY } from "~resources/domain/enums/spreadsheet.dbo"

export interface SpreadsheetMetadata {
  source: string; // Filename or URL
  tabName: string; // Sheet name (important for Google Sheets & Excel)
  columns: Record<string, COLUMN_TYPE>; // Column mapping
  filters: { column: COLUMN_TYPE; condition: string; value: string }[]; // Filtering conditions
  duplicateStrategy: DUPLICATE_HANDLING_STRATEGY; // How duplicates are handled
}
