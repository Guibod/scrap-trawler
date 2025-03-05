import type {
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata,
  SpreadsheetRawData
} from "~resources/domain/dbos/spreadsheet.dbo";
import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo"
import { SpreadsheetColumnDetector } from "~resources/domain/parsers/column.detector"

export abstract class SpreadsheetParser {
  constructor(
    private readonly metadata: SpreadsheetMetadata,
    private readonly knownFirstNames: Set<string> = new Set(),
    private readonly knownLastNames: Set<string> = new Set(),
    private readonly autoDetectColumns: boolean = true
  ) {}

  abstract parse(
    data: ArrayBuffer | string
  ): Promise<{ columns: SpreadsheetColumnMetaData[]; rows: SpreadsheetRawData }>;

  protected computeColumns(columns: string[], rows: SpreadsheetRawData): SpreadsheetColumnMetaData[] {
    const detector = new SpreadsheetColumnDetector(this.knownFirstNames, this.knownLastNames);
    let columnTypes = new Map<number, COLUMN_TYPE>();
    if (this.autoDetectColumns) {
      columnTypes = detector.detectColumns(rows);
    }

    return columns.map((name, index) => {
      const prevValues = this.metadata.columns.find((column) => column.originalName === name);

      return {
        name: prevValues?.name || name,
        originalName: name,
        index,
        type: columnTypes.get(index) || COLUMN_TYPE.IGNORED_DATA,
      };
    });
  }
}
