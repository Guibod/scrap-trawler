import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { PairingMode } from "~/resources/domain/dbos/mapping.dbo"

export type PairingPlayer = (PlayerDbo & { row?: SpreadsheetRow; mode?: PairingMode })