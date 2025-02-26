import type { EventOrganizerDbo } from "~resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import type { TeamDbo } from "~resources/domain/dbos/team.dbo"
import type { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo"

export const EVENT_ENTITY_VERSION = 11

export default class EventEntity {
  id!: string;
  title!: string;
  date!: Date;
  organizer!: EventOrganizerDbo
  players!: Record<PlayerDbo["id"], PlayerDbo>
  teams!: Record<string, TeamDbo>
  rounds!: Record<number, RoundDbo>
  raw_data: {
    wotc: WotcExtractedEvent
    [key: string]: any
  }
  version: number
  scrapeStatus: EventScrapeStateDbo
  lastUpdated!: Date | null
}