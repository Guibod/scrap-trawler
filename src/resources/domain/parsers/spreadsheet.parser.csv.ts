import Papa from "papaparse";
import { SpreadsheetParser } from "~resources/domain/parsers/spreadsheet.parser"
import type { RawSpreadsheetRow, SpreadsheetColumnMetaData } from "~resources/domain/dbos/spreadsheet.dbo"

export class CSVParser extends SpreadsheetParser {
  async parse(data: string): Promise<{ columns: SpreadsheetColumnMetaData[], rows: RawSpreadsheetRow[] }> {
    return new Promise((resolve, reject) => {
      Papa.parse(data, {
        complete: (result) => {
          if (result.errors.length) {
            reject(result.errors);
          } else {
            const [columns, ...rows] = result.data as RawSpreadsheetRow[];
            resolve({ columns: this.computeColumns(columns), rows });
          }
        },
        error: (error) => reject(error),
      });
    });
  }
}
