import type { EventOrganizerDbo } from "~resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import type { TeamDbo } from "~resources/domain/dbos/team.dbo"
import type { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo"
import type { PairingStrategyDbo } from "~resources/domain/enums/pairing.strategy.dbo"
import type { StandingDbo } from "~resources/domain/dbos/standing.dbo"
import type { DropDbo } from "~resources/domain/dbos/drop.dbo"
import type { SpreadsheetRawRow, SpreadsheetMetadata } from "~resources/domain/dbos/spreadsheet.dbo"
import type { MappingDbo } from "~resources/domain/dbos/mapping.dbo"

export const EVENT_ENTITY_VERSION = 21


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
  organizer!: EventOrganizerDbo
  players!: PlayerDbo[]
  teams!: TeamDbo[]
  rounds!: RoundEntity[]
  mapping!: MappingDbo | null
  spreadsheet!: SpreadsheetMetadata | null
  raw_data: {
    wotc: WotcExtractedEvent
    spreadsheet?: SpreadsheetRawRow[]
    [key: string]: any
  }
  version: number
  scrapeStatus: EventScrapeStateDbo
  lastUpdated!: string | null
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
  if (typeof obj.raw_data !== "object") return false;
  if (!("wotc" in obj.raw_data) || typeof obj.raw_data.wotc !== "object") return false;
  if (typeof obj.version !== "number") return false;
  if (typeof obj.scrapeStatus !== "string") return false;
  if (obj.lastUpdated !== null && (typeof obj.lastUpdated !== "string"  || isNaN(new Date(obj.lastUpdated).getTime()))) return false;

  return true;
}

