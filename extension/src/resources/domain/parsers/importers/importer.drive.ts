import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { Importer } from "~/resources/domain/parsers/importers/importer"
import type { ImportedData, SpreadsheetImportRequest } from "~/resources/domain/parsers/importers/types"
import { ImporterUtils } from "~/resources/domain/parsers/importers/utils"
import { OauthService } from "~/resources/integrations/google-oauth/oauth.service"
import { ImporterExcel } from "~/resources/domain/parsers/importers/importer.excel"

const DRIVE_API = "https://www.googleapis.com/drive/v3/files"

export class ImporterGoogleDrive implements Importer {
  static canHandle(req: SpreadsheetImportRequest): boolean {
    return req.metadata.sourceType === "drive"
  }

  private _metadata: SpreadsheetMetadata
  constructor(private readonly request: SpreadsheetImportRequest) {
    this._metadata = ImporterUtils.createDefaultMetadata(this.request)
  }

  get metadata() {
    return this._metadata
  }

  get file(): undefined {
    return undefined
  }

  async prepare(): Promise<void> {
    if (!this._metadata.source || !this._metadata.name) {
      this._metadata = {
        ...this._metadata,
        sourceType: "drive",
      }
    }

    const token = await OauthService.getInstance().getGoogleApiToken()
    const xslxImport = await this.toPseudoXslxImportRequest(token)
    const sheet = await ImporterExcel.pickSheet(xslxImport)

    this._metadata = {
      ...this._metadata,
      sheetId: sheet.id,
      sheetName: sheet.title
    }
  }

  async parse(): Promise<ImportedData> {
    const token = await OauthService.getInstance().getGoogleApiToken()

    const xslxImport = await this.toPseudoXslxImportRequest(token)
    const [columns, ...dataRows] = await ImporterExcel.extractSheet(xslxImport)

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

  async toPseudoXslxImportRequest(token: string): Promise<SpreadsheetImportRequest> {
    const blob = await this.downloadDriveSheetAsXlsx(this._metadata.source, token)

    return {
      metadata: this._metadata,
      file: new File([blob], "pseudo.sheet.xlsx")
    }
  }

  private _cachedBlob: Blob | null = null
  async downloadDriveSheetAsXlsx(fileId: string, token: string): Promise<Blob> {
    if (this._cachedBlob) return this._cachedBlob

    const url = `${DRIVE_API}/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      throw new Error(`Failed to export Google Sheet as XLSX: ${res.status} ${res.statusText}`)
    }

    return await res.blob()
  }
}
