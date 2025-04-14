import { type COLUMN_TYPE, DUPLICATE_STRATEGY, FILTER_OPERATOR } from "~/resources/domain/enums/spreadsheet.dbo"
import type { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

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

export type SpreadsheetSourceType = "file" | "url"

export interface SpreadsheetMetadata {
  sourceType: SpreadsheetSourceType
  autodetect: boolean
  source: string;
  sheet: string | null;
  columns: SpreadsheetColumnMetaData[];
  filters: SpreadsheetFilter[];
  duplicateStrategy: DUPLICATE_STRATEGY;
  format: MTG_FORMATS | null
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