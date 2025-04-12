import type {
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata,
  SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo";
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo"
import { SpreadsheetColumnDetector } from "~/resources/domain/parsers/column.detector"
import { getLogger } from "~/resources/logging/logger"
import type { EventModel } from "~/resources/domain/models/event.model"

export type ImportedData = { columns: SpreadsheetColumnMetaData[]; rows: SpreadsheetRawData }

export interface SyncableImporter {
  supportsSync?: boolean
  sync(meta: SpreadsheetMetadata): Promise<ImportedData>;
}

export abstract class Importer {
  readonly supportsSync: boolean = false;
  protected logger = getLogger("SpreadsheetParser");
  protected knownFirstNames: Set<string> = new Set()
  protected knownLastNames: Set<string> = new Set()
  protected autoDetectColumns: boolean = false

  constructor(
    private readonly metadata: SpreadsheetMetadata,
  ) {}

  static canHandle(meta: SpreadsheetMetadata): boolean {
    return false;
  }

  enableAutoDetectColumns(event: EventModel) {
    this.autoDetectColumns = true
    this.knownFirstNames = new Set<string>();
    this.knownLastNames = new Set<string>();

    Object.values(event.players).forEach(player => {
      if (player.firstName && typeof player.firstName === "string") {
        this.knownFirstNames.add(player.firstName.trim());
      }
      if (player.lastName && typeof player.lastName === "string") {
        this.knownLastNames.add(player.lastName.trim());
      }
    });
  }

  abstract parse(
    data: ArrayBuffer | string
  ): Promise<ImportedData>;

  protected computeColumns(columns: string[] | undefined, rows: SpreadsheetRawData): SpreadsheetColumnMetaData[] {
    if (!columns) {
      this.logger.warn("No columns found in spreadsheet");
      return [];
    }

    const detector = new SpreadsheetColumnDetector(this.knownFirstNames, this.knownLastNames);
    let columnTypes = new Map<number, COLUMN_TYPE>();
    if (this.autoDetectColumns) {
      this.logger.info("Auto-detecting column types");
      columnTypes = detector.detectColumns(rows);
      this.logger.debug("Detected column types", columnTypes);
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

  normalizeRows(rows: SpreadsheetRawData): SpreadsheetRawData {
    const prunedRows = this.pruneTrailingEmptyRows(rows)
    return this.pruneTrailingEmptyColumns(prunedRows)
  }

  private pruneTrailingEmptyRows(rows: SpreadsheetRawData): SpreadsheetRawData {
    let lastNonEmptyIndex = -1

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].some(cell => cell.trim() !== "")) {
        lastNonEmptyIndex = i
      }
    }

    return rows.slice(0, lastNonEmptyIndex + 1)
  }

  private pruneTrailingEmptyColumns(rows: SpreadsheetRawData): SpreadsheetRawData {
    let maxColumn = -1

    for (const row of rows) {
      const lastIndex = row.reduceRight((acc, val, i) =>
          acc === -1 && val.trim() !== "" ? i : acc
        , -1)
      if (lastIndex > maxColumn) maxColumn = lastIndex
    }

    return rows.map(row => row.slice(0, maxColumn + 1))
  }
}
