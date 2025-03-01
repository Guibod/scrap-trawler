import type {
  RawSpreadsheetRow,
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata
} from "~resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo"

export abstract class SpreadsheetParser {
  constructor(private readonly metadata: SpreadsheetMetadata) {}
  abstract parse(data: ArrayBuffer | string): Promise<{ columns: SpreadsheetColumnMetaData[], rows: RawSpreadsheetRow[] }>;

  protected computeColumns(
    row: RawSpreadsheetRow,
  ): SpreadsheetColumnMetaData[] {
    const mergedMap = new Map<number, SpreadsheetColumnMetaData>();

    row.forEach((name, index) => {
      const prevValues = this.metadata.columns.find((column) => column.originalName === name);

      mergedMap.set(index, {
        name: prevValues?.name || name,
        originalName: name,
        index,
        type: prevValues?.type || COLUMN_TYPE.IGNORED_DATA,
      });
    });
    return Array.from(mergedMap.values());
  }
}
