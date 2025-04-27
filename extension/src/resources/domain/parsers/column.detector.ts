import { COLUMN_TYPE, COLUMN_TYPE_UNIQUE } from "~/resources/domain/enums/spreadsheet.dbo"
import type { SpreadsheetRawRow } from "~/resources/domain/dbos/spreadsheet.dbo";
import { SpreadsheetColumnScorer } from "~/resources/domain/parsers/column.scorer"
import { getLogger } from "~/resources/logging/logger"

export class SpreadsheetColumnDetector {
  private readonly knownFirstNames: Set<string>;
  private readonly knownLastNames: Set<string>;
  private readonly logger = getLogger("SpreadsheetColumnDetector");

  constructor(knownFirstNames: Iterable<string>, knownLastNames: Iterable<string>) {
    this.knownFirstNames = new Set([...knownFirstNames].map(name => name.toLowerCase()));
    this.knownLastNames = new Set([...knownLastNames].map(name => name.toLowerCase()));
  }

  detectColumns(rows: SpreadsheetRawRow[]): Map<number, COLUMN_TYPE> {
    const columnScores: Map<number, Map<COLUMN_TYPE, number>> = new Map();

    const columnCount = Math.max(...rows.map((r) => r.length), 0);
    const columns: string[][] = Array.from({ length: columnCount }, () => []);

    rows.forEach(row => {
      row.forEach((value, colIndex) => {
        try {
          columns[colIndex].push(value);
        } catch (error) {
          this.logger.error(`Error processing column ${colIndex}: ${error} with value ${value}`);
          throw error
        }
      });
    });

    columns.forEach((values, index) => {
      const scores = this.detectColumn(values);
      columnScores.set(index, scores);

      const debugLines = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([type, score]) => `    - ${type}: ${score.toFixed(2)}`)
        .join("\n");
      this.logger.debug(`Column ${index} score breakdown:\n${debugLines}`);
    });

    const resolved = this.resolveUniqueColumns(columnScores);
    this.logger.info("Detected column types:", Object.fromEntries(resolved));
    return resolved;
  }

  detectColumn(values: string[]): Map<COLUMN_TYPE, number> {
    return SpreadsheetColumnScorer.calculateScores(values, this.knownFirstNames, this.knownLastNames);
  }

  private resolveUniqueColumns(columnScores: Map<number, Map<COLUMN_TYPE, number>>): Map<number, COLUMN_TYPE> {
    const assignedColumns: Map<number, COLUMN_TYPE> = new Map();
    const takenTypes = new Set<COLUMN_TYPE>();

    const priorityOrder = [
      COLUMN_TYPE.IGNORED_DATA,
      COLUMN_TYPE.UNIQUE_ID,
      COLUMN_TYPE.FIRST_NAME,
      COLUMN_TYPE.LAST_NAME,
      COLUMN_TYPE.DECKLIST_URL,
      COLUMN_TYPE.DECKLIST_TXT,
      COLUMN_TYPE.ARCHETYPE,
      COLUMN_TYPE.PLAYER_DATA,
      COLUMN_TYPE.FILTER,
    ];

    const sortedColumns = [...columnScores.entries()]
      .map(([index, scores]) => {
        const bestType = this.getBestType(scores);
        this.logger.debug(`Column ${index} best type guess: ${bestType.type} (score: ${bestType.score})`);
        return { index, bestType };
      })
      .sort((a, b) => {
        const priorityDiff = priorityOrder.indexOf(a.bestType.type) - priorityOrder.indexOf(b.bestType.type);
        if (priorityDiff !== 0) return priorityDiff;
        return b.bestType.score - a.bestType.score;
      });

    for (const { index, bestType } of sortedColumns) {
      if (COLUMN_TYPE_UNIQUE.includes(bestType.type)) {
        if (takenTypes.has(bestType.type)) {
          this.logger.debug(`Column ${index} skipped: ${bestType.type} already assigned, defaulting to IGNORED_DATA.`);
          assignedColumns.set(index, COLUMN_TYPE.IGNORED_DATA);
        } else {
          this.logger.debug(`Column ${index} assigned as unique type: ${bestType.type}`);
          assignedColumns.set(index, bestType.type);
          takenTypes.add(bestType.type);
        }
      } else {
        this.logger.debug(`Column ${index} assigned as: ${bestType.type}`);
        assignedColumns.set(index, bestType.type);
      }
    }

    return assignedColumns;
  }

  private getBestType(scores: Map<COLUMN_TYPE, number>): { type: COLUMN_TYPE; score: number } {
    return [...scores.entries()].reduce((best, [type, score]) => (score > best.score ? { type, score } : best), {
      type: COLUMN_TYPE.IGNORED_DATA,
      score: 0,
    });
  }
}