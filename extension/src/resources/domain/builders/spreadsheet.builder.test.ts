import { describe, it, expect } from "vitest";
import SpreadsheetBuilder from "~/resources/domain/builders/spreadsheet.builder"
import { DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"


describe("SpreadsheetBuilder", () => {
  it("should build a spreadsheet with default values", () => {
    const spreadsheet = new SpreadsheetBuilder().build();

    expect(spreadsheet.meta.source).toBe("Unknown");
    expect(spreadsheet.meta.sheetName).toBeNull();
    expect(spreadsheet.meta.sheetId).toBeNull();
    expect(spreadsheet.meta.importedAt).toBeNull();
    expect(spreadsheet.meta.columns).toEqual([]);
    expect(spreadsheet.meta.filters).toEqual([]);
    expect(spreadsheet.meta.duplicateStrategy).toBe(DUPLICATE_STRATEGY.NONE);
    expect(spreadsheet.meta.finalized).toBe(false);
    expect(spreadsheet.data).toEqual([]);
  });

  it("should set metadata values correctly", () => {
    const spreadsheet = new SpreadsheetBuilder()
      .withSource("Google Sheets")
      .withSheetName("Decklists")
      .withDuplicateStrategy(DUPLICATE_STRATEGY.KEEP_FIRST)
      .finalized(true)
      .build();

    expect(spreadsheet.meta.source).toBe("Google Sheets");
    expect(spreadsheet.meta.sheetName).toBe("Decklists");
    expect(spreadsheet.meta.duplicateStrategy).toBe(DUPLICATE_STRATEGY.KEEP_FIRST);
    expect(spreadsheet.meta.finalized).toBe(true);
  });

  it("should generate fake columns", () => {
    const spreadsheet = new SpreadsheetBuilder()
      .withDimension(3, 10)
      .build();

    expect(spreadsheet.meta.columns.length).toBe(3);
    spreadsheet.meta.columns.forEach((col, index) => {
      expect(col.name).toBe(`Column ${index + 1}`);
      expect(col.originalName).toBe(`Original Column ${index + 1}`);
      expect(col.index).toBe(index);
    });
  });

  it("should generate fake rows", () => {
    const spreadsheet = new SpreadsheetBuilder()
      .withDimension(2, 5)
      .build();

    expect(spreadsheet.data.length).toBe(5);
    spreadsheet.data.forEach(row => {
      expect(row.id).toBeDefined();
      expect(row.player["WotcID"]).toBeDefined();
      expect(row.archetype).toBeDefined();
      expect(row.decklistUrl).toBeDefined();
      expect(row.decklistTxt).toBeDefined();
      expect(row.firstName).toBeDefined();
      expect(row.lastName).toBeDefined();
    });
  });

  it("should allow setting rows manually", () => {
    const rows = [
      {
        id: "test-id",
        player: { "WotcID": "ABC123" },
        archetype: "Control Deck",
        decklistUrl: "https://example.com/decklist",
        decklistTxt: "Decklist contents...",
        firstName: "John",
        lastName: "Doe",
      },
    ];
    const spreadsheet = new SpreadsheetBuilder()
      .withRows(rows)
      .build();

    expect(spreadsheet.data.length).toBe(1);
    expect(spreadsheet.data[0].id).toBe("test-id");
    expect(spreadsheet.data[0].player["WotcID"]).toBe("ABC123");
    expect(spreadsheet.data[0].archetype).toBe("Control Deck");
  });
});