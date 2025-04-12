import { describe, expect, it } from "vitest"
import { DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"
import { ImporterCsv } from "~/resources/domain/parsers/importers/importer.csv"
import type { SpreadsheetSourceType } from "~/resources/domain/dbos/spreadsheet.dbo"

describe("CsvSpreadsheetParser", () => {
  const parser = new ImporterCsv(
    {
      source: 'foo.csv',
      sourceType: 'file',
      tabName: null,
      columns: [],
      filters: [],
      finalized: false,
      format: null,
      duplicateStrategy: DUPLICATE_STRATEGY.NONE
    }
  );
  parser.enableAutoDetectColumns({
    players: {
      a: {firstName: "Alice", lastName: "Smith"},
      b: {firstName: "Bob", lastName: "Smith"},
      c: {firstName: "Charles", lastName: "Jones"},
      d: {firstName: "Didier", lastName: "Smith"},
    }
  } as unknown as EventModel)

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
