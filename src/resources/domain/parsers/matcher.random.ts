import { AutoMatcher } from "~/resources/domain/parsers/matcher";
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo";
import type { SpreadsheetData } from "~/resources/domain/dbos/spreadsheet.dbo";
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo";

export class RandomMatcher extends AutoMatcher {
  constructor(eventPlayers: PlayerDbo[], spreadsheetPlayers: SpreadsheetData, pairs: MappingDbo | null) {
    super(eventPlayers, spreadsheetPlayers, pairs);
  }

  match(): MappingDbo {
    const updatedPairings: MappingDbo = { ...this.pairs }; // Preserve existing pairings

    // Get a list of unpaired event players
    const unpairedEventPlayers = this.eventPlayers.filter((p) => !updatedPairings[p.id]);

    // Get a list of unpaired spreadsheet players
    const pairedRowIds = new Set(Object.values(updatedPairings).map((entry) => entry.rowId));
    const availableSpreadsheetPlayers = this.spreadsheetPlayers.filter((p) => !pairedRowIds.has(p.id));

    // Shuffle the available spreadsheet players
    const shuffledPlayers = [...availableSpreadsheetPlayers].sort(() => Math.random() - 0.5);

    // Assign remaining event players to shuffled spreadsheet players
    unpairedEventPlayers.forEach((eventPlayer, index) => {
      if (shuffledPlayers[index]) {
        updatedPairings[eventPlayer.id] = { rowId: shuffledPlayers[index].id, mode: "random" };
      }
    });

    return updatedPairings;
  }
}
