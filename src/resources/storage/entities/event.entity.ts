import type { EventOrganizerDbo } from "~resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import type { TeamDbo } from "~resources/domain/dbos/team.dbo"
import type { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo"
import type { PairingStrategyDbo } from "~resources/domain/enums/pairing.strategy.dbo"
import type { StandingDbo } from "~resources/domain/dbos/standing.dbo"
import type { DropDbo } from "~resources/domain/dbos/drop.dbo"

export const EVENT_ENTITY_VERSION = 19


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
  raw_data: {
    wotc: WotcExtractedEvent
    [key: string]: any
  }
  version: number
  scrapeStatus: EventScrapeStateDbo
  lastUpdated!: Date | null
}