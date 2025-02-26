import type { EventOrganizerDbo } from "~resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"

export interface EventWriteDbo {
  id?: string;
  title?: string;
  date?: Date;
  organizer?: EventOrganizerDbo
  players?: Record<PlayerDbo["id"], PlayerDbo>
  rounds?: Record<number, RoundDbo>
  raw_data: {
    wotc: WotcExtractedEvent,
    [key: string]: any
  }
  lastUpdated?: Date;
  version?: number
}
