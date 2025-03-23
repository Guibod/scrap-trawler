import type {
  SpreadsheetData,
  SpreadsheetMetadata, SpreadsheetRow
} from "~/resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo"
import { SpreadsheetDataFactory } from "~/resources/domain/parsers/spreadsheet.data.factory"

export async function mapSpreadsheetData(rawData: string[][], metadata: SpreadsheetMetadata): Promise<SpreadsheetData> {
  return new SpreadsheetDataFactory(metadata, rawData).generate();
}
