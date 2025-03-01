import type { EventOrganizerDbo } from "~resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import type { TeamDbo } from "~resources/domain/dbos/team.dbo"
import type { SpreadsheetMetadata } from "~resources/domain/dbos/spreadsheet.dbo"

export interface EventWriteDbo {
  id?: string;
  title?: string;
  date?: Date;
  organizer?: EventOrganizerDbo
  teams?: Record<TeamDbo["id"], TeamDbo>
  players?: Record<PlayerDbo["id"], PlayerDbo>
  rounds?: Record<number, RoundDbo>
  spreadsheet?: {
    data: string[][]  // not sure if this is the right type
    meta: SpreadsheetMetadata
  },
  raw_data: {
    wotc: WotcExtractedEvent,
    [key: string]: any
  }
  lastUpdated?: Date;
  version?: number
}
