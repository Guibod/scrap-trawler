import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { ImporterCsv } from "~/resources/domain/parsers/importers/importer.csv"
import { ImporterExcel } from "~/resources/domain/parsers/importers/importer.excel"
import { ImporterGoogle } from "~/resources/domain/parsers/importers/importer.google"
import type { Importer } from "~/resources/domain/parsers/importers/importer"

export class ImporterFactory {
  private static readonly registeredParsers = [
    ImporterCsv,
    ImporterExcel,
    ImporterGoogle
  ];

  static create(meta: SpreadsheetMetadata): Importer {
    const Parser = this.registeredParsers.find((P) => P.canHandle(meta));
    if (!Parser) {
      throw new Error(`No parser found for ${meta.source}`);
    }
    return new Parser(meta);
  }
}
