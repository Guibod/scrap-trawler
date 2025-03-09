import type { EventOrganizerDbo } from "~resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import type { TeamDbo } from "~resources/domain/dbos/team.dbo"
import type { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo"
import type { PairingStrategyDbo } from "~resources/domain/enums/pairing.strategy.dbo"
import type { StandingDbo } from "~resources/domain/dbos/standing.dbo"
import type { DropDbo } from "~resources/domain/dbos/drop.dbo"
import type { SpreadsheetRawRow, SpreadsheetMetadata, SpreadsheetRowId } from "~resources/domain/dbos/spreadsheet.dbo"
import type { WotcId } from "~resources/domain/dbos/identifiers.dbo"

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
  date!: Date;
  organizer!: EventOrganizerDbo
  players!: PlayerDbo[]
  teams!: TeamDbo[]
  rounds!: RoundEntity[]
  mapping!: Record<WotcId, SpreadsheetRowId> | null
  spreadsheet!: SpreadsheetMetadata | null
  raw_data: {
    wotc: WotcExtractedEvent
    spreadsheet?: SpreadsheetRawRow[]
    [key: string]: any
  }
  version: number
  scrapeStatus: EventScrapeStateDbo
  lastUpdated!: Date | null
}

/**
 * Type guard to check if an object is a valid `EventEntity`.
 * Ensures required fields exist with correct types.
 *
 * @param obj - The object to validate.
 * @returns {obj is EventEntity} - `true` if the object matches the type, otherwise `false`.
 */
export function isEventEntity(obj: any): obj is EventEntity {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    obj.date instanceof Date &&
    typeof obj.organizer === "object" &&
    Array.isArray(obj.players) &&
    Array.isArray(obj.teams) &&
    Array.isArray(obj.rounds) &&
    (obj.mapping === null || typeof obj.mapping === "object") &&
    (obj.spreadsheet === null || typeof obj.spreadsheet === "object") &&
    typeof obj.raw_data === "object" &&
    "wotc" in obj.raw_data &&
    typeof obj.raw_data.wotc === "object" &&
    typeof obj.version === "number" &&
    typeof obj.scrapeStatus === "object" &&
    (obj.lastUpdated === null || obj.lastUpdated instanceof Date)
  );
}
