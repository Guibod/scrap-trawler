import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { ImporterCsv } from "~/resources/domain/parsers/importers/importer.csv"
import { ImporterExcel } from "~/resources/domain/parsers/importers/importer.excel"
import { ImporterGoogle } from "~/resources/domain/parsers/importers/importer.google"
import type { Importer, SyncableImporter } from "~/resources/domain/parsers/importers/importer"
import type { EventModel } from "~/resources/domain/models/event.model"

type SyncableImporterClass = {
  new (meta: SpreadsheetMetadata): SyncableImporter;
  supportsSync: true;
  enableAutoDetectColumns: (event: EventModel) => void;
  canHandle(meta: SpreadsheetMetadata): boolean;
}

export class ImporterFactory {
  private static readonly registeredParsers = [
    ImporterCsv,
    ImporterExcel,
    ImporterGoogle
  ];

  static getImporterFor(meta: SpreadsheetMetadata): Importer {
    const Parser = this.registeredParsers.find((P) => P.canHandle(meta));
    if (!Parser) {
      throw new Error(`No parser found for ${meta.source}`);
    }
    return new Parser(meta);
  }

  static getSyncableImporterFor(meta: SpreadsheetMetadata): SyncableImporter {
    for (const P of this.registeredParsers) {
      if (
        (P as any).supportsSync === true &&
        typeof (P as any).canHandle === "function" &&
        (P as any).canHandle(meta)
      ) {
        return new P(meta) as unknown as SyncableImporter;
      }
    }
    throw new Error(`No parser found for ${meta.source}`);
  }
}
