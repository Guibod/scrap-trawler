import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { ImportedData, SpreadsheetImportRequest } from "~/resources/domain/parsers/importers/types"


export interface Importer {
  get file(): File | undefined
  get metadata(): SpreadsheetMetadata
  prepare(): Promise<void>
  parse(): Promise<ImportedData>
}

export interface ImporterClass {
  canHandle(input: SpreadsheetImportRequest): boolean
  new(input: SpreadsheetImportRequest): Importer
}