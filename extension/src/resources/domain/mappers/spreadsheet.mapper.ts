import type {
  SpreadsheetData,
  SpreadsheetMetadata
} from "~/resources/domain/dbos/spreadsheet.dbo"
import { SpreadsheetDataFactory } from "~/resources/domain/parsers/spreadsheet.data.factory"
import type { SpreadsheetMetadataEntity } from "~/resources/storage/entities/event.entity"

export async function mapSpreadsheet(
  entity: SpreadsheetMetadataEntity,
  raw: any
): Promise<{
  meta: SpreadsheetMetadata
  data: SpreadsheetData
} | null> {
  if (!entity) return null;

  const meta: SpreadsheetMetadata = {
    ...entity,
    importedAt: entity?.importedAt ? new Date(entity.importedAt) : null,
  }

  return {
    meta,
    data: await new SpreadsheetDataFactory(meta, raw).generate()
  }
}