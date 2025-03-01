import * as XLSX from "xlsx";
import { SpreadsheetParser } from "~resources/domain/parsers/spreadsheet.parser"
import type { RawSpreadsheetRow, SpreadsheetColumnMetaData } from "~resources/domain/dbos/spreadsheet.dbo"

export class ExcelParser extends SpreadsheetParser {
  async parse(data: ArrayBuffer): Promise<{ columns: SpreadsheetColumnMetaData[], rows: RawSpreadsheetRow[] }> {
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as RawSpreadsheetRow[];

    const [columns, ...rows] = allRows;
    return { columns: this.computeColumns(columns), rows };
  }
}
