import Papa from "papaparse";
import type {
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata,
  SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo"
import { Importer } from "~/resources/domain/parsers/importers/importer"

export class ImporterCsv extends Importer {
  static canHandle(meta: SpreadsheetMetadata) {
    return meta.source.toLowerCase().endsWith(".csv");
  }

  async parse(data: ArrayBufferLike): Promise<{ columns: SpreadsheetColumnMetaData[], rows: SpreadsheetRawData }> {
    const string = new TextDecoder().decode(new Uint8Array(data))
    return new Promise((resolve, reject) => {
      Papa.parse(string, {
        skipEmptyLines: true,
        complete: (result) => {
          const [columns, ...rows] = this.normalizeRows(result.data as SpreadsheetRawData);
          resolve({ columns: this.computeColumns(columns, rows), rows });
        },
        error: (error) => reject(error),
      });
    });
  }
}
