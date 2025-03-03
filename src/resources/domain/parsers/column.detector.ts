import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo";
import type { RawSpreadsheetRow } from "~resources/domain/dbos/spreadsheet.dbo";
import { SpreadsheetColumnScorer } from "~resources/domain/parsers/column.scorer"

export class SpreadsheetColumnDetector {
  private readonly knownFirstNames: Set<string>;
  private readonly knownLastNames: Set<string>;

  constructor(knownFirstNames: Iterable<string>, knownLastNames: Iterable<string>) {
    this.knownFirstNames = new Set([...knownFirstNames].map(name => name.toLowerCase()));
    this.knownLastNames = new Set([...knownLastNames].map(name => name.toLowerCase()));
  }

  detectColumns(rows: RawSpreadsheetRow[]): Map<number, COLUMN_TYPE> {
    const columnScores: Map<number, Map<COLUMN_TYPE, number>> = new Map();

    // Transpose rows into columns
    const columnCount = rows[0]?.length || 0;
    const columns: string[][] = Array.from({ length: columnCount }, () => []);

    rows.forEach(row => {
      row.forEach((value, colIndex) => {
        columns[colIndex].push(value);
      });
    });

    // Step 1: Assign initial type guesses with confidence scores
    columns.forEach((values, index) => {
      columnScores.set(index, this.detectColumn(values));
    });

    // Step 2: Resolve conflicting column types (unique ones)
    return this.resolveUniqueColumns(columnScores);
  }

  detectColumn(values: string[]): Map<COLUMN_TYPE, number> {
    return SpreadsheetColumnScorer.calculateScores(values, this.knownFirstNames, this.knownLastNames);
  }

  private resolveUniqueColumns(columnScores: Map<number, Map<COLUMN_TYPE, number>>): Map<number, COLUMN_TYPE> {
    const assignedColumns: Map<number, COLUMN_TYPE> = new Map();
    const takenTypes = new Set<COLUMN_TYPE>();

    // **🔹 Prioritized Order of Unique Columns**
    const priorityOrder = [
      COLUMN_TYPE.IGNORED_DATA, // **Default category (can be multiple)**
      COLUMN_TYPE.UNIQUE_ID,    // **Only one**
      COLUMN_TYPE.FIRST_NAME,   // **Only one**
      COLUMN_TYPE.LAST_NAME,    // **Only one**
      COLUMN_TYPE.DECKLIST_URL, // **Only one**
      COLUMN_TYPE.DECKLIST_TXT, // **Only one**
      COLUMN_TYPE.PLAYER_DATA,  // **Multiple allowed**
      COLUMN_TYPE.FILTER,       // **Multiple allowed**
    ];

    // **Sort columns by highest confidence score**
    const sortedColumns = [...columnScores.entries()]
      .map(([index, scores]) => ({ index, bestType: this.getBestType(scores) }))
      .sort((a, b) => {
        // **Sort by predefined priority first**
        const priorityDiff = priorityOrder.indexOf(a.bestType.type) - priorityOrder.indexOf(b.bestType.type);
        if (priorityDiff !== 0) return priorityDiff;
        // **If priority is the same, sort by score (higher first)**
        return b.bestType.score - a.bestType.score;
      });

    for (const { index, bestType } of sortedColumns) {
      if (this.canHaveMultiple(bestType.type) || !takenTypes.has(bestType.type)) {
        assignedColumns.set(index, bestType.type);
        takenTypes.add(bestType.type);
      } else {
        assignedColumns.set(index, COLUMN_TYPE.IGNORED_DATA); // Default to ignored if already assigned
      }
    }

    return assignedColumns;
  }

  /**
   * Determines whether a column type can have multiple instances.
   */
  private canHaveMultiple(type: COLUMN_TYPE): boolean {
    return type === COLUMN_TYPE.IGNORED_DATA || type === COLUMN_TYPE.PLAYER_DATA || type === COLUMN_TYPE.FILTER;
  }

  private getBestType(scores: Map<COLUMN_TYPE, number>): { type: COLUMN_TYPE; score: number } {
    return [...scores.entries()].reduce((best, [type, score]) => (score > best.score ? { type, score } : best), {
      type: COLUMN_TYPE.IGNORED_DATA,
      score: 0,
    });
  }
}
