import type {
  SpreadsheetData,
  SpreadsheetMetadata,
  SpreadsheetRawData,
  SpreadsheetRow
} from "~/resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE, COLUMN_TYPE_META, FILTER_OPERATOR } from "~/resources/domain/enums/spreadsheet.dbo"
import { DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo";
import { hashStringSHA1 } from "~/resources/utils/crypto"

export class SpreadsheetDataFactory {
  constructor(
    private readonly meta: SpreadsheetMetadata,
    private readonly rawData: SpreadsheetRawData
  ) {}

  public async generate(): Promise<SpreadsheetData | null> {
    try {
      let filteredData = this.applyFilters(this.rawData);
      filteredData = this.applyDuplicateStrategy(filteredData);
      return this.transformToSpreadsheetData(filteredData);
    } catch (error) {
      console.error("Failed to generate spreadsheet data", error);
      return null;
    }
  }

  private applyFilters(data: SpreadsheetRawData): SpreadsheetRawData {
    if (!this.meta.filters.length) return data;

    return data.filter((row) =>
      this.meta.filters.every(({ column, operator, values }) => {
        const cellValue = row[column];

        switch (operator) {
          case FILTER_OPERATOR.INCLUDES:
            return values.includes(cellValue)
          case FILTER_OPERATOR.EXCLUDES:
            return !values.includes(cellValue)
          case FILTER_OPERATOR.CONTAINS:
            return values.every((value) => cellValue.includes(String(value)))
          case FILTER_OPERATOR.EQUALS:
            return values.every((value) => cellValue === value)
          case FILTER_OPERATOR.NOT_EQUALS:
            return !values.every((value) => cellValue === value)
          default:
            return true;
        }
      })
    );
  }

  private applyDuplicateStrategy(data: SpreadsheetRawData): SpreadsheetRawData {
    if (this.meta.duplicateStrategy === DUPLICATE_STRATEGY.NONE) {
      return data; // No filtering
    }

    const uniqueColIndex = this.meta.columns.findIndex(({ type }) => type === COLUMN_TYPE.UNIQUE_ID);
    if (uniqueColIndex === -1) return data;

    const seen = new Map<string, number>();
    return data.filter((row, index) => {
      const uniqueValue = row[uniqueColIndex];
      if (seen.has(uniqueValue)) {
        return this.meta.duplicateStrategy === DUPLICATE_STRATEGY.KEEP_LAST ? index === seen.get(uniqueValue) : false;
      }
      seen.set(uniqueValue, index);
      return true;
    });
  }

  private async transformToSpreadsheetData(data: SpreadsheetRawData): Promise<SpreadsheetData> {
    const columnMap = this.meta.columns.reduce((acc, col, index) => {
      acc[col.type] = index;
      return acc;
    }, {} as Record<string, number>);

    if (!data) return [];

    return Promise.all(data.map(async (row, index) => {
      const uniqueId = await hashStringSHA1(row[columnMap[COLUMN_TYPE.UNIQUE_ID]] ?? index.toString());

      return {
        id: uniqueId,
        player: this.extractPlayerData(row, columnMap),
        archetype: SpreadsheetDataFactory.normalizeText(row[columnMap[COLUMN_TYPE.ARCHETYPE]]),
        decklistUrl: SpreadsheetDataFactory.normalizeText(row[columnMap[COLUMN_TYPE.DECKLIST_URL]]),
        decklistTxt: SpreadsheetDataFactory.normalizeText(row[columnMap[COLUMN_TYPE.DECKLIST_TXT]]),
        firstName: SpreadsheetDataFactory.normalizeText(row[columnMap[COLUMN_TYPE.FIRST_NAME]], true),
        lastName: SpreadsheetDataFactory.normalizeText(row[columnMap[COLUMN_TYPE.LAST_NAME]], true),
      } as SpreadsheetRow;
    }));
  }

  private extractPlayerData(row: string[], columnMap: Record<string, number>): Record<string, string> {
    return Object.keys(columnMap)
      .filter((key) => COLUMN_TYPE_META[key]?.grouped)
      .reduce((acc, key) => {
        acc[key] = row[columnMap[key]] || "";
        return acc;
      }, {} as Record<string, string>);
  }

  static normalizeText(input: string | null | undefined, normalizeCase = false): string {
    if (!input) return '';

    let normalized = input.trim().replace(/\s+/g, ' ');

    if (normalizeCase) {
      normalized = SpreadsheetDataFactory.capitalizeFirstLetters(normalized);
    }

    return normalized;
  };

  static capitalizeFirstLetters (input: string): string {
    if (!input) return '';

    return input
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
}
