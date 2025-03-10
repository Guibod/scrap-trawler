import type { WotcId } from "~/resources/domain/dbos/identifiers.dbo"
import type { SpreadsheetRowId } from "~/resources/domain/dbos/spreadsheet.dbo"

export type PairingMode = "manual" | "random" | "name-strict" | "name-swap" | "name-first-initial" | "name-last-initial" | "name-levenshtein";

export type MappingEntryDbo = { rowId: SpreadsheetRowId, mode: PairingMode }

export type MappingDbo = Record<WotcId, MappingEntryDbo>