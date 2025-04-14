import { describe, it, expect, vi } from "vitest";
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo";
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo";
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo";
import { RandomMatcher } from "~/resources/domain/parsers/matcher.random"

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

describe("RandomMatcher", () => {
  it("should assign unpaired players randomly while preserving existing pairings", () => {
    const existingPairings: MappingDbo = {
      "wotc-1": { rowId: "sheet-1", mode: "manual" }, // Alice is already paired
    };

    const matcher = new RandomMatcher(eventPlayers, spreadsheetPlayers, existingPairings);
    const result = matcher.match();

    // Ensure existing pairing is preserved
    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "manual" });

    // Ensure other players are assigned
    expect(result["wotc-2"]).toBeDefined();
    expect(result["wotc-3"]).toBeDefined();

    // Ensure no duplicate assignments
    const assignedSheetIds = new Set(Object.values(result).map((p) => p.rowId));
    expect(assignedSheetIds.size).toBe(Object.keys(result).length);
  });

  it("should not assign more players than available", () => {
    const fewerSpreadsheetPlayers: SpreadsheetRow[] = [
      { id: "sheet-1", firstName: "Alice", lastName: "Smith" } as SpreadsheetRow,
    ];

    const matcher = new RandomMatcher(eventPlayers, fewerSpreadsheetPlayers, null);
    const result = matcher.match();

    // Only 1 player should be assigned
    expect(Object.keys(result).length).toBe(1);
  });

  it("should assign every player uniquely", () => {
    const matcher = new RandomMatcher(eventPlayers, spreadsheetPlayers, null);
    const result = matcher.match();

    const assignedRowIds = Object.values(result).map((entry) => entry.rowId);
    const uniqueRowIds = new Set(assignedRowIds);

    // Ensure every player is assigned uniquely
    expect(uniqueRowIds.size).toBe(assignedRowIds.length);
  });

  it("should not reassign already paired players", () => {
    const existingPairings: MappingDbo = {
      "wotc-1": { rowId: "sheet-1", mode: "manual" },
      "wotc-2": { rowId: "sheet-2", mode: "manual" },
    };

    const matcher = new RandomMatcher(eventPlayers, spreadsheetPlayers, existingPairings);
    const result = matcher.match();

    expect(result["wotc-1"]).toEqual({ rowId: "sheet-1", mode: "manual" });
    expect(result["wotc-2"]).toEqual({ rowId: "sheet-2", mode: "manual" });

    // Ensure only unpaired players are assigned
    expect(result["wotc-3"]).toBeDefined();
  });

  it("should return an empty object if no spreadsheet players are available", () => {
    const matcher = new RandomMatcher(eventPlayers, [], null);
    const result = matcher.match();

    expect(result).toEqual({});
  });
});
