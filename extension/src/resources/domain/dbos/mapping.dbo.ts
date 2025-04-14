import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"

export type PairingMode = "manual" | "random" | "name-strict" | "name-swap" | "name-first-initial" | "name-last-initial" | "name-levenshtein";

export type MappingEntryDbo = { rowId: SpreadsheetRowId, mode: PairingMode }

export type MappingDbo = Record<WotcId, MappingEntryDbo>

export function pairingModeDescription(mode: PairingMode) {
  switch (mode) {
    case "manual":
      return "manual matching"
    case "random":
      return "random assignment"
    case "name-strict":
      return "strict name matching"
    case "name-swap":
      return "first/last name swap"
    case "name-first-initial":
      return "first name initial match"
    case "name-last-initial":
      return "last name initial match"
    case "name-levenshtein":
      return "fuzzy name matching (Levenshtein)"
    default:
      return "an unknown method"
  }
}