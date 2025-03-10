import { type COLUMN_TYPE, DUPLICATE_STRATEGY, FILTER_OPERATOR } from "~/resources/domain/enums/spreadsheet.dbo"

export interface SpreadsheetColumnMetaData {
  name: string
  originalName: string
  index: number
  type: COLUMN_TYPE
}

export type SpreadsheetFilter = {
  column: number | null;
  operator: FILTER_OPERATOR;
  values: string[];
};

export interface SpreadsheetMetadata {
  source: string;
  tabName: string | null;
  columns: SpreadsheetColumnMetaData[];
  filters: SpreadsheetFilter[];
  duplicateStrategy: DUPLICATE_STRATEGY;
  finalized: boolean
}

export type SpreadsheetRawRow = string[];
export type SpreadsheetRawData = SpreadsheetRawRow[];

export type SpreadsheetRowId = string;

export type SpreadsheetRow = {
  id: string, // hashed version of the unique id column
  player: Record<string, string>,
  archetype: string,
  decklistUrl: string,
  decklistTxt: string,
  firstName: string,
  lastName: string,
}
export type SpreadsheetData = SpreadsheetRow[];