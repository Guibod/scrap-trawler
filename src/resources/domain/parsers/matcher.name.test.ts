import { describe, it, expect } from "vitest";
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo";
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo";
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo";
import { NameMatcher } from "~/resources/domain/parsers/matcher.name"

// Sample test data
const eventPlayers: PlayerDbo[] = [
  { id: "wotc-1", firstName: "Alice", lastName: "Smith" } as PlayerDbo,
  { id: "wotc-2", firstName: "Bob", lastName: "Jones" } as PlayerDbo,
  { id: "wotc-3", firstName: "Charlie", lastName: "Brown" } as PlayerDbo,
];

const spreadsheetPlayers: SpreadsheetRow[] = [
  { id: "sheet-1", firstName: "Alice", lastName: "Smith" } as SpreadsheetRow,
  { id: "sheet-2", firstName: "Bob", lastName: "Jones" } as SpreadsheetRow,
  { id: "sheet-3", firstName: "Charlie", lastName: "Brown" } as SpreadsheetRow,
];

describe("NameMatcher", () => {
  it("should preserve existing pairings", () => {
    const existingPairings: MappingDbo = {
      "wotc-1": { rowId: "sheet-1", mode: "manual" },
    };

    const matcher = new NameMatcher(eventPlayers, spreadsheetPlayers, existingPairings);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "manual" });
  });

  it("should match names strictly (ignoring diacritics)", () => {
    const modifiedSpreadsheet = [
      { id: "sheet-1", firstName: "Àlice", lastName: "Smíth" } as SpreadsheetRow, // Diacritics
    ];

    const matcher = new NameMatcher(eventPlayers, modifiedSpreadsheet, null);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "name-strict" });
  });

  it("should match swapped first and last names", () => {
    const modifiedSpreadsheet = [
      { id: "sheet-1", firstName: "Smith", lastName: "Alice" } as SpreadsheetRow, // Swapped
    ];

    const matcher = new NameMatcher(eventPlayers, modifiedSpreadsheet, null);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "name-swap" });
  });

  it("should match first name initial + last name full", () => {
    const modifiedSpreadsheet = [
      { id: "sheet-1", firstName: "A.", lastName: "Smith" } as SpreadsheetRow,
    ];

    const matcher = new NameMatcher(eventPlayers, modifiedSpreadsheet, null);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "name-first-initial" });
  });

  it("should match full first name + last name initial", () => {
    const modifiedSpreadsheet = [
      { id: "sheet-1", firstName: "Alice", lastName: "S." } as SpreadsheetRow,
    ];

    const matcher = new NameMatcher(eventPlayers, modifiedSpreadsheet, null);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "name-last-initial" });
  });

  it("should match names using Levenshtein distance", () => {
    const modifiedSpreadsheet = [
      { id: "sheet-1", firstName: "Alicia", lastName: "Smoth" } as SpreadsheetRow, // Close spelling
    ];

    const matcher = new NameMatcher(eventPlayers, modifiedSpreadsheet, null);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "name-levenshtein" });
  });

  it("should not override existing pairings", () => {
    const existingPairings: MappingDbo = {
      "wotc-1": { rowId: "sheet-1", mode: "manual" },
    };

    const matcher = new NameMatcher(eventPlayers, spreadsheetPlayers, existingPairings);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "manual" });
    expect(result["wotc-2"]).toBeDefined();
    expect(result["wotc-3"]).toBeDefined();
  });

  it("should not match unmatched players", () => {
    const modifiedSpreadsheet = [
      { id: "sheet-1", firstName: "Xyz", lastName: "Unknown" } as SpreadsheetRow,
    ];

    const matcher = new NameMatcher(eventPlayers, modifiedSpreadsheet, null);
    const result = matcher.match();

    expect(result["wotc-1"]).toBeUndefined();
    expect(result["wotc-2"]).toBeUndefined();
    expect(result["wotc-3"]).toBeUndefined();
  });
});
