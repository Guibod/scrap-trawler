import * as XLSX from "xlsx"
import type {
  SpreadsheetMetadata, SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo"
import type { Importer } from "./importer"
import type { ImportedData, SheetTab, SpreadsheetImportRequest } from "~/resources/domain/parsers/importers/types"
import { ImporterUtils } from "~/resources/domain/parsers/importers/utils"
import SheetSelector from "~/resources/ui/components/spreadsheet/tab.picker"

export class ImporterExcel implements Importer {
  static canHandle(req: SpreadsheetImportRequest): boolean {
    return req.file?.name.toLowerCase().endsWith(".xlsx")
  }

  private _metadata: SpreadsheetMetadata

  constructor(private readonly request: SpreadsheetImportRequest) {
    this._metadata = ImporterUtils.createDefaultMetadata(request)
  }

  get metadata(): SpreadsheetMetadata {
    return this._metadata
  }

  get file(): File | undefined {
    return this.request.file
  }

  async prepare(): Promise<void> {
    if (!this.file) throw new Error("No XLSX file provided")

    const sheet = await ImporterExcel.pickSheet(this.request)
    this._metadata = {
      ...this._metadata,
      sheetId: sheet.id,
      sheetName: sheet.title
    }
  }

  async parse(): Promise<ImportedData> {
    if (!this.request.file) throw new Error("No XLSX file provided")

    const [columns, ...rows] = await ImporterExcel.extractSheet(this.request)

    return {
      columns: ImporterUtils.computeColumns(
        columns,
        rows,
        ImporterUtils.extractKnownNames(this.request.event),
        this._metadata.autodetect,
        this._metadata.columns
      ),
      rows
    }
  }

  static async extractSheet(req: SpreadsheetImportRequest): Promise<SpreadsheetRawData> {
    const workbook = XLSX.read(await req.file.arrayBuffer(), { type: "array" })

    // This mess is to support both int-like and string-like sheetId
    const sheetId = req.metadata.sheetId
    const sheetIndex = sheetId ? parseInt(sheetId) : 0
    const fallbackName = (i: number) => `Sheet #${i + 1}`
    const sheetNames = workbook.SheetNames.map((title, idx) =>
      title?.trim() ? title : fallbackName(idx)
    )

    const sheetName = sheetNames[sheetIndex] ?? sheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    if (!sheet) throw new Error(`Sheet not found for id ${sheetId}`)

    return ImporterUtils.normalizeRows(
      XLSX.utils.sheet_to_json(sheet, { header: 1 }) as SpreadsheetRawData
    )
  }

  static async pickSheet(req: SpreadsheetImportRequest): Promise<SheetTab> {
    const buffer = await req.file!.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })

    const fallbackName = (i: number) => `Sheet #${i + 1}`
    const sheetNames = workbook.SheetNames.map((title, idx) =>
      title?.trim() ? title : fallbackName(idx)
    )

    const sheets: SheetTab[] = sheetNames.map((title, index) => {
      const ref = workbook.Sheets[title]["!ref"]
      const range = ref ? XLSX.utils.decode_range(ref) : { e: { r: 0, c: 0 } }

      return {
        id: String(index),
        title,
        index,
        hidden: false,
        rowCount: range.e.r + 1,
        columnCount: range.e.c + 1
      }
    })

    const { sheetId, sheetName } = req.metadata

    const candidate = sheets.find(s => s.id === sheetId)
    const nameMatches = candidate && candidate.title === sheetName

    if (candidate && nameMatches) {
      return candidate
    }

    // Warning if metadata exists but no match → the file likely changed
    const fileChanged = sheetId !== null || sheetName !== null

    const selected = await SheetSelector.open(
      sheets,
      `Please pick a sheet tab for ${req.file?.name}`,
      fileChanged
    )

    if (!selected) throw new Error("No sheet selected")

    return selected
  }

}
