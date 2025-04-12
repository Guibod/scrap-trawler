import * as XLSX from "xlsx";
import type { SpreadsheetRawRow, SpreadsheetColumnMetaData, SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { Importer } from "~/resources/domain/parsers/importers/importer"

export class ImporterExcel extends Importer {
  static canHandle(meta: SpreadsheetMetadata) {
    return meta.source.toLowerCase().endsWith(".xlsx");
  }

  async parse(data: ArrayBuffer): Promise<{ columns: SpreadsheetColumnMetaData[], rows: SpreadsheetRawRow[] }> {
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const allRows = this.normalizeRows(
      XLSX.utils.sheet_to_json(sheet, { header: 1 }) as SpreadsheetRawRow[]
    );
    const [columns, ...rows] = allRows;
    return { columns: this.computeColumns(columns, rows), rows };
  }
}
