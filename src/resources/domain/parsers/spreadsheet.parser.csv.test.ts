import { describe, expect, it } from "vitest"
import { CSVParser } from "~/resources/domain/parsers/spreadsheet.parser.csv"
import { DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"

describe("CsvSpreadsheetParser", () => {
  const parser = new CSVParser(
    {
      source: 'foo.csv',
      tabName: null,
      columns: [],
      filters: [],
      finalized: false,
      duplicateStrategy: DUPLICATE_STRATEGY.NONE
    },
    new Set(["Alice", "Bob", "Charles", "Didier"]),
    new Set(["Smith", "Jones"]),
    true
  );

  it("parses a simple CSV with headers", async () => {
    const csvContent = `f-i-r-s-t-n-a-m-e,deck
Alice,Gruul Aggro
Bob,Dimir Control
Charles,Dimir Control
Didier,Boros Burn
`;
    const result = await parser.parse(csvContent);

    expect(result.columns).toEqual([
      {
        "index": 0,
        "name": "f-i-r-s-t-n-a-m-e",
        "originalName": "f-i-r-s-t-n-a-m-e",
        "type": 'firstName',
      },
      {
        "index": 1,
        "name": "deck",
        "originalName": "deck",
        "type": expect.anything(),
      },
    ]);
    expect(result.rows[0]).toEqual(
      ["Alice", "Gruul Aggro"],
    );
  });

  it("returns empty rows for empty CSV", async () => {
    const result = await parser.parse("");

    expect(result.columns).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it("handles extra columns gracefully", async () => {
    const csvContent = `name,deck,email
Charlie,Mono Green,charlie@example.com
Dana,Boros Burn,dana@example.com
`;
    const result = await parser.parse(csvContent);

    expect(result.columns).toEqual([
      {
        "index": 0,
        "name": "name",
        "originalName": "name",
        "type": expect.anything(),
      },
      {
        "index": 1,
        "name": "deck",
        "originalName": "deck",
        "type": expect.anything(),
      },
      {
        "index": 2,
        "name": "email",
        "originalName": "email",
        "type": "uniqueId",
      },
    ]);
    expect(result.rows[0][0]).toBe("Charlie");
    expect(result.rows[0][2]).toBe("charlie@example.com");
  });
});
