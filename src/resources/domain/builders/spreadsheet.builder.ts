import { faker } from "@faker-js/faker";
import type {
  SpreadsheetColumnMetaData,
  SpreadsheetData,
  SpreadsheetMetadata, SpreadsheetRow
} from "~/resources/domain/dbos/spreadsheet.dbo"
import { COLUMN_TYPE, DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"

export default class SpreadsheetBuilder {
  private metadata: Partial<SpreadsheetMetadata> = {};
  private data: SpreadsheetData = [];
  private dimensions: { x: number; y: number } = { x: 0, y: 0 };

  withSource(source: string) {
    this.metadata.source = source;
    return this;
  }

  withTabName(tabName: string | null) {
    this.metadata.tabName = tabName;
    return this;
  }

  withColumns(columns: SpreadsheetColumnMetaData[]) {
    this.metadata.columns = columns;
    return this;
  }

  withFilters(filters: SpreadsheetMetadata["filters"]) {
    this.metadata.filters = filters;
    return this;
  }

  withDuplicateStrategy(strategy: DUPLICATE_STRATEGY) {
    this.metadata.duplicateStrategy = strategy;
    return this;
  }

  finalized(finalized: boolean = true) {
    this.metadata.finalized = finalized;
    return this;
  }

  withRows(rows: SpreadsheetRow[]) {
    this.data = rows;
    return this;
  }

  withDimension(x: number, y: number) {
    this.dimensions = { x, y };
    return this
  }

  private generateFakeColumns(columnCount: number) {
    return Array.from({ length: columnCount }, (_, index) => ({
      name: `Column ${index + 1}`,
      originalName: `Original Column ${index + 1}`,
      index,
      type: faker.helpers.arrayElement(Object.values(COLUMN_TYPE)),
    }));
  }

  private generateFakeRows(rowCount: number) {
    return Array.from({ length: rowCount }, () => ({
      id: faker.string.uuid(),
      player: { "WotcID": faker.string.alphanumeric(10) },
      archetype: faker.word.words(2),
      decklistUrl: faker.internet.url(),
      decklistTxt: faker.lorem.paragraph(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }));
  }

  build() {
    return {
      meta: {
        source: this.metadata.source ?? "Unknown",
        tabName: this.metadata.tabName ?? null,
        columns: this.metadata.columns ?? this.generateFakeColumns(this.dimensions.x),
        filters: this.metadata.filters ?? [],
        duplicateStrategy: this.metadata.duplicateStrategy ?? DUPLICATE_STRATEGY.NONE,
        finalized: this.metadata.finalized ?? false,
      },
      data: this.data.length ? this.data : this.generateFakeRows(this.dimensions.y),
    };
  }
}