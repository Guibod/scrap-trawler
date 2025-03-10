import { faker } from "@faker-js/faker";
import type { MappingDbo, PairingMode } from "~/resources/domain/dbos/mapping.dbo"
import type { SpreadsheetData } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"

export default class MappingDboBuilder {
  private mapping: MappingDbo = {};

  withEntry(wotcId: string, rowId: string, mode: PairingMode) {
    this.mapping[wotcId] = { rowId, mode };
    return this;
  }

  withPlayersAndSpreadsheet(players: PlayerDbo[], spreadsheet: SpreadsheetData, mode: PairingMode = "manual") {
    const availableRows = faker.helpers.shuffle([...spreadsheet]);

    players.forEach((player) => {
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