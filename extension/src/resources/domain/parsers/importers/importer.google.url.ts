import { GoogleSheetsService } from "~/resources/integrations/google-doc/spreadsheet.service"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { type ImportedData, Importer, type SyncableImporter } from "~/resources/domain/parsers/importers/importer"

export class ImporterGoogleUrl extends Importer implements SyncableImporter {
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

  async parse(data: ArrayBufferLike): Promise<ImportedData> {
    const url = new TextDecoder().decode(new Uint8Array(data))
    if (typeof url !== "string") {
      throw new Error("Expected data to be a Google Sheets URL string")
    }

    return this.sync({ source: url })
  }
}
