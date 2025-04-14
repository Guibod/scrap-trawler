import type {
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata,
  SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo";
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo"
import { SpreadsheetColumnDetector } from "~/resources/domain/parsers/column.detector"
import { getLogger } from "~/resources/logging/logger"
import type { EventModel } from "~/resources/domain/models/event.model"

const fallbackColumnName: Record<COLUMN_TYPE, (index: number) => string> = {
  archetype: () => "Archetype",
  decklistTxt: () => "Decklist as Text",
  decklistUrl: () => "Decklist URL",
  filter: (index) => `Filter #${index + 1}`,
  firstName: () => "First Name",
  ignored: (index) => `Ignored #${index + 1}`,
  lastName: () => "Last Name",
  player: (index) => `Player data #${index + 1}`,
  uniqueId: () => "Unique ID",
}

export type ImportedData = { columns: SpreadsheetColumnMetaData[]; rows: SpreadsheetRawData }

export interface SyncableImporter{
  supportsSync?: boolean
  sync(meta: SpreadsheetMetadata): Promise<ImportedData>;
  enableAutoDetectColumns(event: EventModel): this
}

export function isSyncableImporter(obj: any): obj is SyncableImporter {
  return (
    typeof obj === "object" &&
    obj !== null &&
    obj.supportsSync === true &&
    typeof obj.sync === "function"
  )
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

  enableAutoDetectColumns(event: EventModel): this {
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
    return this;
  }

  abstract parse(
    data: ArrayBufferLike
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
      const type = columnTypes.get(index) || COLUMN_TYPE.IGNORED_DATA

      return {
        name: prevValues?.name || name.trim() || fallbackColumnName[type](index),
        originalName: name,
        index,
        type,
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
      if (rows[i].some(cell => {
        if (typeof cell === "string") {
          return cell.trim() !== ""
        }
        return cell !== null && cell !== undefined
      })) {
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
