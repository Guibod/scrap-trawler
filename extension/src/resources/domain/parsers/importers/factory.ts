import type { SpreadsheetImportRequest } from "~/resources/domain/parsers/importers/types"
import type { Importer, ImporterClass } from "~/resources/domain/parsers/importers/importer"
import { ImporterCsv } from "~/resources/domain/parsers/importers/importer.csv"
import { ImporterExcel } from "~/resources/domain/parsers/importers/importer.excel"
import { ImporterGoogleDrive } from "~/resources/domain/parsers/importers/importer.drive"

export class ImporterFactory {
  private static readonly registered: ImporterClass[] = [
    ImporterCsv,
    ImporterExcel,
    ImporterGoogleDrive
  ]

  static create(request: SpreadsheetImportRequest): Importer {
    const ImporterCtor = this.registered.find((klass) => klass.canHandle(request))
    if (!ImporterCtor) {
      throw new Error(`No importer found for source: ${request.metadata.source}`)
    }
    return new ImporterCtor(request)
  }
}
