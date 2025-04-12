import { GoogleSheetsService } from "~/resources/integrations/google-doc/spreadsheet.service"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { type ImportedData, Importer, type SyncableImporter } from "~/resources/domain/parsers/importers/importer"

export class ImporterGoogle extends Importer implements SyncableImporter {
  readonly supportsSync = true

  static canHandle(meta: SpreadsheetMetadata) {
    return GoogleSheetsService.isSpreadsheetUrl(meta.source)
  }

  async sync(meta: Pick<SpreadsheetMetadata, 'source'>): Promise<ImportedData> {
    const { sheetId, gid } = GoogleSheetsService.parseSheetUrl(meta.source)
    const rawRows = this.normalizeRows(await GoogleSheetsService.getInstance().fetchRange(sheetId, gid))
    if (rawRows.length === 0) {
      return { columns: [], rows: [] }
    }

    const [columns, ...rows] = rawRows

    return { columns: this.computeColumns(columns, rows), rows }
  }

  async parse(data: ArrayBuffer | string): Promise<ImportedData> {
    if (typeof data !== "string") {
      throw new Error("Expected data to be a Google Sheets URL string")
    }

    return this.sync({ source: data })
  }
}
