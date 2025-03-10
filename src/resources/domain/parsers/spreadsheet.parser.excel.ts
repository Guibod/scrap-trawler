import * as XLSX from "xlsx";
import { SpreadsheetParser } from "~/resources/domain/parsers/spreadsheet.parser"
import type { SpreadsheetRawRow, SpreadsheetColumnMetaData } from "~/resources/domain/dbos/spreadsheet.dbo"

export class ExcelParser extends SpreadsheetParser {
  async parse(data: ArrayBuffer): Promise<{ columns: SpreadsheetColumnMetaData[], rows: SpreadsheetRawRow[] }> {
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as SpreadsheetRawRow[];

    const [columns, ...rows] = allRows;
    return { columns: this.computeColumns(columns, rows), rows };
  }
}
