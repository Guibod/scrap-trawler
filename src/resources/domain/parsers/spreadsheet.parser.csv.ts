import Papa from "papaparse";
import { SpreadsheetParser } from "~resources/domain/parsers/spreadsheet.parser"
import type { SpreadsheetRawRow, SpreadsheetColumnMetaData } from "~resources/domain/dbos/spreadsheet.dbo"

export class CSVParser extends SpreadsheetParser {
  async parse(data: string): Promise<{ columns: SpreadsheetColumnMetaData[], rows: SpreadsheetRawRow[] }> {
    return new Promise((resolve, reject) => {
      Papa.parse(data, {
        complete: (result) => {
          if (result.errors.length) {
            reject(result.errors);
          } else {
            const [columns, ...rows] = result.data as SpreadsheetRawRow[];
            resolve({ columns: this.computeColumns(columns, rows), rows });
          }
        },
        error: (error) => reject(error),
      });
    });
  }
}
