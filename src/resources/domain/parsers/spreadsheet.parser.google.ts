import { NotYetImplemented } from "~resources/exception"
import { SpreadsheetParser } from "~resources/domain/parsers/spreadsheet.parser"
import type { SpreadsheetRawRow, SpreadsheetColumnMetaData } from "~resources/domain/dbos/spreadsheet.dbo"

export class GoogleSheetsParser extends SpreadsheetParser {
  async parse(data: ArrayBuffer | string): Promise<{ columns: SpreadsheetColumnMetaData[], rows: SpreadsheetRawRow[] }> {
    // const response = await fetch(this.metadata.source);
    // const text = await response.text();
    // return text.split("\n").map((row) => row.split(","));
    throw new NotYetImplemented("Google Sheets parsing is not yet implemented");
  }
}
