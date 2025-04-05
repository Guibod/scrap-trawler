import type { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import type { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import type { CardName } from "~/resources/storage/entities/event.entity"

export enum DeckSource {
  MOXFIELD = "Moxfield",
  TEXT = "Text",
  UNKNOWN = "Unknown"
}

export type DeckCardDbo = {
  name: string,
  quantity: number
}

export type DeckBoardsDbo = {
  mainboard: DeckCardDbo[],
  sideboard?: DeckCardDbo[],
  commanders?: DeckCardDbo[],
  companions?: DeckCardDbo[],
  signatureSpells?: DeckCardDbo[],
}

export type DeckDbo = {
  id: string;  // Optional UUID
  url?: string;  // External source (Moxfield, Archidekt, etc.)
  spreadsheetRowId: string;  // Reference to SpreadsheetRawRow.id
  lastUpdated: Date | null; // ISO timestamp, if available from the source
  boards: DeckBoardsDbo,
  source: DeckSource,
  archetype: string | null,
  face: CardName | null,
  status: DeckStatus;
  legal: boolean;
  format: MTG_FORMATS;
  colors: MTG_COLORS[]
}

export enum DeckStatus {
  PENDING = "PENDING",
  FETCHED = "FETCHED",
  ERROR = "ERROR",
  FAILED = "FAILED"
}