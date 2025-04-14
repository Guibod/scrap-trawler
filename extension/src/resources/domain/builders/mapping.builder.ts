import { faker } from "@faker-js/faker";
import type { MappingDbo, PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import type { SpreadsheetData, SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"

export default class MappingDboBuilder {
  private mapping: MappingDbo = {};

  withEntry(wotcId: string, rowId: string, mode: PairingMode) {
    this.mapping[wotcId] = { rowId, mode };
    return this;
  }

  withPlayersAndSpreadsheet(players: PlayerDbo[], spreadsheet: SpreadsheetData, mapping: Map<WotcId, SpreadsheetRowId>, mode: PairingMode = "manual") {
    const availableRows = faker.helpers.shuffle([...spreadsheet]);
    const availablePlayers = [...players];

    availablePlayers.forEach((player) => {
      if (mapping.has(player.id)) {
        const rowId = mapping.get(player.id);
        const matchingRow = availableRows.find((row) => row.id === rowId);
        if (matchingRow) {
          this.mapping[player.id] = {
            rowId: matchingRow.id,
            mode,
          };
          availableRows.splice(availableRows.indexOf(matchingRow), 1);
          availablePlayers.splice(availablePlayers.indexOf(player), 1);
        }
      }
    });

    availablePlayers.forEach((player) => {
      if (availableRows.length > 0) {
        const matchingRow = availableRows.pop(); // Assign a unique row to each player
        if (matchingRow) {
          this.mapping[player.id] = {
            rowId: matchingRow.id,
            mode,
          };
        }
      }
    });
    return this;
  }

  build(): MappingDbo {
    return this.mapping;
  }
}