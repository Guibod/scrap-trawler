import type {
  RawSpreadsheetRow,
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata
} from "~resources/domain/dbos/spreadsheet.dbo";
import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo"
import { SpreadsheetColumnDetector } from "~resources/domain/parsers/column.detector"

export abstract class SpreadsheetParser {
  constructor(
    private readonly metadata: SpreadsheetMetadata,
    private readonly knownFirstNames: Set<string> = new Set(),
    private readonly knownLastNames: Set<string> = new Set(),
  ) {}

  abstract parse(
    data: ArrayBuffer | string,
  ): Promise<{ columns: SpreadsheetColumnMetaData[]; rows: RawSpreadsheetRow[] }>;

  protected computeColumns(columns: RawSpreadsheetRow, rows: RawSpreadsheetRow[]): SpreadsheetColumnMetaData[] {
    console.log(this.knownFirstNames, this.knownLastNames)
    const detector = new SpreadsheetColumnDetector(this.knownFirstNames, this.knownLastNames);
    const columnTypes = detector.detectColumns(rows);
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
