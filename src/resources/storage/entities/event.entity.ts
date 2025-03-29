import type { EventOrganizerDbo } from "~/resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { WotcExtractedEvent } from "~/resources/integrations/eventlink/event-extractor"
import type { TeamDbo } from "~/resources/domain/dbos/team.dbo"
import type { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"
import type { PairingStrategyDbo } from "~/resources/domain/enums/pairing.strategy.dbo"
import type { StandingDbo } from "~/resources/domain/dbos/standing.dbo"
import type { DropDbo } from "~/resources/domain/dbos/drop.dbo"
import type { SpreadsheetRawRow, SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"
import type { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"

export const EVENT_ENTITY_VERSION = 23

export type CardName = string
export type CardNameAndQuantity = { name: CardName, quantity: number }
export type DeckBoards = {
  mainboard: CardNameAndQuantity[],
  sideboard?: CardNameAndQuantity[],
  commanders?: CardNameAndQuantity[],
  companions?: CardNameAndQuantity[],
  signatureSpells?: CardNameAndQuantity[],
}
export type DeckDescription = {
  id: string,
  archetype: string | null,
  name: string,
  url: string | null,
  face: CardName | null,
  boards: DeckBoards | null,
  lastUpdated: string | null,
  format: MTG_FORMATS | null,
  legal: boolean
  colors: MTG_COLORS[],
}

export interface DeckEntity extends DeckDescription {
  id: string
  spreadsheetRowId: string
  errors?: string[]
  status: DeckStatus
}

export interface ResultEntity {
  id: string,
  isBye: boolean
  wins: number,
  losses: number,
  draws: number
}

export interface MatchEntity {
  id: string
  isBye: boolean
  teamIds: string[],
  tableNumber: number,
  results: ResultEntity[]
}

export interface RoundEntity{
  id: string
  roundNumber: number
  isFinalRound: boolean
  isPlayoff: boolean
  isCertified: boolean
  pairingStrategy: PairingStrategyDbo
  matches: MatchEntity[]
  standings: StandingDbo[]
  drops: DropDbo[]
}

export default class EventEntity {
  id!: string;
  title!: string;
  date!: string;
  format: MTG_FORMATS | null;
  organizer!: EventOrganizerDbo
  players!: PlayerDbo[]
  teams!: TeamDbo[]
  rounds!: RoundEntity[]
  mapping!: MappingDbo | null
  spreadsheet!: SpreadsheetMetadata | null // We only keep the metadata, the rest is computed from raw_data.spreadsheet
  decks!: DeckEntity[]
  raw_data: {
    wotc: WotcExtractedEvent
    spreadsheet?: SpreadsheetRawRow[]
    fetch?: Record<string, any>
    [key: string]: any
  }
  version: number
  scrapeStatus: EventScrapeStateDbo
  lastUpdated!: string | null
  lastScrapedAt!: string | null
}

export function isUpToDateEntity(obj: any): boolean {
  return isEventEntity(obj) && obj.version === EVENT_ENTITY_VERSION
}

/**
 * Type guard to check if an object is a valid `EventEntity`.
 * Ensures required fields exist with EventEntity types.
 *
 * @param obj - The object to validate.
 * @returns {obj is EventEntity} - `true` if the object matches the type, otherwise `false`.
 */
export function isEventEntity(obj: any): obj is EventEntity {
  if (typeof obj !== "object" || obj === null) return false;
  if (typeof obj.id !== "string") return false;
  if (typeof obj.title !== "string") return false;
  if (typeof obj.date !== "string" || isNaN(new Date(obj.date).getTime())) return false;
  if (typeof obj.organizer !== "object") return false;
  if (!Array.isArray(obj.players)) return false;
  if (!Array.isArray(obj.teams)) return false;
  if (!Array.isArray(obj.rounds)) return false;
  if (obj.mapping !== null && typeof obj.mapping !== "object") return false;
  if (obj.spreadsheet !== null && typeof obj.spreadsheet !== "object") return false;
  if (obj.decks && !Array.isArray(obj.decks)) return false;
  if (typeof obj.raw_data !== "object") return false;
  if (!("wotc" in obj.raw_data) || typeof obj.raw_data.wotc !== "object") return false;
  if (typeof obj.version !== "number") return false;
  if (typeof obj.scrapeStatus !== "string") return false;
  if (obj.lastUpdated !== null && (typeof obj.lastUpdated !== "string"  || isNaN(new Date(obj.lastUpdated).getTime()))) return false;
  if (obj.lastScrapedAt !== null && (typeof obj.lastScrapedAt !== "string"  || isNaN(new Date(obj.lastScrapedAt).getTime()))) return false;

  return true;
}

