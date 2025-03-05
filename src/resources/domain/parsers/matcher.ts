import type { SpreadsheetData } from "~resources/domain/dbos/spreadsheet.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { MappingDbo } from "~resources/domain/dbos/mapping.dbo"

export abstract class AutoMatcher {
  constructor(
    protected readonly eventPlayers: PlayerDbo[],
    protected readonly spreadsheetPlayers: SpreadsheetData,
    protected readonly pairs: MappingDbo | null
  ) {
  }
  abstract match(): MappingDbo;
}