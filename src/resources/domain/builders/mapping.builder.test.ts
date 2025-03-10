import { describe, it, expect } from "vitest";
import MappingDboBuilder from "~/resources/domain/builders/mapping.builder"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { SpreadsheetData } from "~/resources/domain/dbos/spreadsheet.dbo"
import { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"


describe("MappingDboBuilder", () => {
  it("should build an empty mapping by default", () => {
    const mapping = new MappingDboBuilder().build();
    expect(Object.keys(mapping)).toHaveLength(0);
  });

  it("should add an entry manually", () => {
    const mapping = new MappingDboBuilder()
      .withEntry("wotc-123", "row-456", "manual")
      .build();

    expect(mapping["wotc-123"]).toBeDefined();
    expect(mapping["wotc-123"].rowId).toBe("row-456");
    expect(mapping["wotc-123"].mode).toBe("manual");
  });

  it("should pair players with spreadsheet rows uniquely", () => {
    const players: PlayerDbo[] = [
      { id: "player-1", avatar: null, isAnonymized: false, archetype: null, tournamentId: "tournament-1", teamId: "team-1", displayName: "Player One", firstName: "John", lastName: "Doe", status: PlayerStatusDbo.IDENTIFIED, tableNumber: null, overrides: null },
      { id: "player-2", avatar: null, isAnonymized: false, archetype: null, tournamentId: "tournament-1", teamId: "team-2", displayName: "Player Two", firstName: "Jane", lastName: "Doe", status: PlayerStatusDbo.IDENTIFIED, tableNumber: null, overrides: null }
    ];

    const spreadsheet: SpreadsheetData = [
      { id: "row-1", player: { WotcID: "player-1" }, archetype: "Control", decklistUrl: "", decklistTxt: "", firstName: "John", lastName: "Doe" },
      { id: "row-2", player: { WotcID: "player-2" }, archetype: "Aggro", decklistUrl: "", decklistTxt: "", firstName: "Jane", lastName: "Doe" }
    ];

    const mapping = new MappingDboBuilder()
      .withPlayersAndSpreadsheet(players, spreadsheet, "name-strict")
      .build();

    expect(Object.keys(mapping)).toHaveLength(2);
    expect(mapping["player-1"].rowId).toBeDefined();
    expect(mapping["player-2"].rowId).toBeDefined();
  });

  it("should not assign a row if there are more players than spreadsheet rows", () => {
    const players: PlayerDbo[] = [
      { id: "player-1", avatar: null, isAnonymized: false, archetype: null, tournamentId: "tournament-1", teamId: "team-1", displayName: "Player One", firstName: "John", lastName: "Doe", status: PlayerStatusDbo.IDENTIFIED, tableNumber: null, overrides: null },
      { id: "player-2", avatar: null, isAnonymized: false, archetype: null, tournamentId: "tournament-1", teamId: "team-2", displayName: "Player Two", firstName: "Jane", lastName: "Doe", status: PlayerStatusDbo.IDENTIFIED, tableNumber: null, overrides: null }
    ];

    const spreadsheet: SpreadsheetData = [
      { id: "row-1", player: { WotcID: "player-1" }, archetype: "Control", decklistUrl: "", decklistTxt: "", firstName: "John", lastName: "Doe" }
    ];

    const mapping = new MappingDboBuilder()
      .withPlayersAndSpreadsheet(players, spreadsheet, "name-strict")
      .build();

    expect(Object.keys(mapping)).toHaveLength(1);
    expect(mapping["player-1"].rowId).toBe("row-1");
    expect(mapping["player-2"]).toBeUndefined();
  });
});