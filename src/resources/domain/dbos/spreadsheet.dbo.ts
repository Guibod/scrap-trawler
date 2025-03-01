import { type COLUMN_TYPE, DUPLICATE_HANDLING_STRATEGY } from "~resources/domain/enums/spreadsheet.dbo"

export interface SpreadsheetColumnMetaData {
  name: string
  originalName: string
  index: number
  type: COLUMN_TYPE
}

export interface SpreadsheetMetadata {
  source: string;
  tabName: string | null;
  columns: SpreadsheetColumnMetaData[];
  filters: { column: string; value: string; condition: "equals" | "not_equals" }[];
  duplicateStrategy: DUPLICATE_HANDLING_STRATEGY;
}

export type ProcessedSpreadsheetRow = {
  [COLUMN_TYPE.UNIQUE_ID]: string;
  [COLUMN_TYPE.FIRST_NAME]: string | null;
  [COLUMN_TYPE.LAST_NAME]: string | null;
  [COLUMN_TYPE.ARCHETYPE]: string | null;
  [COLUMN_TYPE.DECKLIST_URL]: string | null;
  [COLUMN_TYPE.PLAYER_DATA]: Record<string, string | number | null>;
};

export type RawSpreadsheetRow = string[];