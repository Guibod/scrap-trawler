import Papa from "papaparse"
import type {
  SpreadsheetMetadata,
  SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo"

import { ImporterUtils } from "./utils"
import type { Importer } from "./importer"
import type {
  ImportedData,
  SpreadsheetImportRequest
} from "~/resources/domain/parsers/importers/types"

export class ImporterCsv implements Importer {
  static canHandle(req: SpreadsheetImportRequest): boolean {
    return req.file?.name?.toLowerCase().endsWith(".csv")
  }

  private _metadata: SpreadsheetMetadata
  constructor(private readonly request: SpreadsheetImportRequest) {
    this._metadata = ImporterUtils.createDefaultMetadata(this.request)
  }

  get metadata() {
    return this._metadata
  }

  get file() {
    return this.request.file
  }

  async prepare(): Promise<void> {
    // No interactive prep needed for CSV
  }

  async parse(): Promise<ImportedData> {
    if (!this.request.file) throw new Error("No file provided")

    const parsed = Papa.parse<string[]>(
      await this.request.file.text(),
      {
        skipEmptyLines: true
      }
    )

    const rows = parsed.data as SpreadsheetRawData
    const normalized = ImporterUtils.normalizeRows(rows)
    const [columns, ...dataRows] = normalized

    return {
      columns: ImporterUtils.computeColumns(
        columns,
        dataRows,
        ImporterUtils.extractKnownNames(this.request.event),
        this._metadata.autodetect,
        this._metadata.columns
      ),
      rows: dataRows
    }
  }
}
