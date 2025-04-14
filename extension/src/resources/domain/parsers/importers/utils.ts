import { COLUMN_TYPE, DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"
import { SpreadsheetColumnDetector } from "~/resources/domain/parsers/column.detector"
import type {
  SpreadsheetColumnMetaData,
  SpreadsheetMetadata,
  SpreadsheetRawData
} from "~/resources/domain/dbos/spreadsheet.dbo"
import type {
  KnownIdentities,
  SpreadsheetImportRequest
} from "~/resources/domain/parsers/importers/types"
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
  uniqueId: () => "Unique ID"
}

export class ImporterUtils {
  static computeColumns(
    columns: string[] | undefined,
    rows: SpreadsheetRawData,
    knownIdentities: KnownIdentities,
    autodetect: boolean,
    previousColumns: SpreadsheetColumnMetaData[]
  ): SpreadsheetColumnMetaData[] {
    if (!columns || columns.length === 0) return []

    const safeCurrentColumns = Array.from({ length: columns.length }, (_, i) =>
      typeof columns[i] === "string" ? columns[i].trim() : ""
    )
    const safePreviousColumns = previousColumns
      .filter((c): c is SpreadsheetColumnMetaData => !!c)
    const detector = new SpreadsheetColumnDetector(knownIdentities.firstNames, knownIdentities.lastNames)

    let columnTypes = new Map<number, COLUMN_TYPE>()
    if (autodetect) {
      columnTypes = detector.detectColumns(rows)
    }

    const seen = new Map<string, number>()
    return safeCurrentColumns.map((rawName, index) => {
      const name = rawName?.trim() ?? ""
      const previous = safePreviousColumns.find(c => c.index === index)
      const type = columnTypes.get(index) ?? COLUMN_TYPE.IGNORED_DATA

      // Compute final name (fallback or previous or generated)
      let baseName = previous?.name || name || fallbackColumnName[type](index)

      // Ensure uniqueness
      const count = seen.get(baseName) ?? 0
      seen.set(baseName, count + 1)

      const uniqueName = count > 0 ? `${baseName} (${count + 1})` : baseName

      return {
        name: uniqueName,
        originalName: previous?.originalName ?? rawName,
        index,
        type
      }
    })
  }

  static normalizeRows(rows: SpreadsheetRawData): SpreadsheetRawData {
    const pruned = this.pruneTrailingEmptyRows(rows)
    return this.pruneTrailingEmptyColumns(pruned)
  }

  private static pruneTrailingEmptyRows(rows: SpreadsheetRawData): SpreadsheetRawData {
    let lastNonEmpty = -1

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].some(cell => typeof cell === "string" ? cell.trim() !== "" : cell != null)) {
        lastNonEmpty = i
      }
    }

    return rows.slice(0, lastNonEmpty + 1)
  }

  private static pruneTrailingEmptyColumns(rows: SpreadsheetRawData): SpreadsheetRawData {
    let maxCol = -1

    for (const row of rows) {
      const lastNonEmpty = row.reduceRight(
        (acc, val, i) => acc === -1 && String(val).trim() !== "" ? i : acc,
        -1
      )
      if (lastNonEmpty > maxCol) maxCol = lastNonEmpty
    }

    return rows.map(row => row.slice(0, maxCol + 1))
  }

  static createDefaultMetadata(req: SpreadsheetImportRequest): SpreadsheetMetadata {
    if (!req.metadata.sourceType && !req.file) {
      throw new Error("No source type or file provided")
    }

    return {
      sheetId: null,
      sheetName: null,
      importedAt: null,
      filters: [],
      columns: [],
      sourceType: req.file ? "file" : req.metadata.sourceType,
      name: req.file?.name ?? "",
      source: req.file?.name ?? "",
      format: null,
      finalized: false,
      duplicateStrategy: DUPLICATE_STRATEGY.NONE,
      autodetect: false,
      ...req.metadata
    }
  }

  static extractKnownNames(event: EventModel): KnownIdentities {
    const firstNames = new Set<string>();
    const lastNames = new Set<string>();

    if (event) {
      Object.values(event.players).forEach(player => {
        if (player.firstName && typeof player.firstName === "string") {
          firstNames.add(player.firstName.trim());
        }
        if (player.lastName && typeof player.lastName === "string") {
          lastNames.add(player.lastName.trim());
        }
      });
    }

    return {
      firstNames,
      lastNames
    }
  }
}
