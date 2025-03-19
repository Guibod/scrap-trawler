import type { EventStatusDbo } from "~/resources/domain/dbos/status.dbo"
import type { EventOrganizerDbo } from "~/resources/domain/dbos/event.organizer.dbo"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { RoundDbo } from "~/resources/domain/dbos/round.dbo"
import type { WotcExtractedEvent } from "~/resources/integrations/eventlink/event-extractor"
import type { TeamDbo } from "~/resources/domain/dbos/team.dbo"
import type { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"
import type {
  SpreadsheetRawRow,
  SpreadsheetMetadata, SpreadsheetData, SpreadsheetRowId
} from "~/resources/domain/dbos/spreadsheet.dbo"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"
import type { DeckDbo } from "~/resources/domain/dbos/deck.dbo"
import type { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

export interface EventModel {
  id: string;
  title: string;
  date: Date;
  format: MTG_FORMATS | null,
  organizer: EventOrganizerDbo
  players: Record<PlayerDbo["id"], PlayerDbo>
  teams: Record<string, TeamDbo>
  status: EventStatusDbo,
  rounds: Record<number, RoundDbo>
  mapping: MappingDbo | null,
  decks: Record<SpreadsheetRowId, DeckDbo>
  spreadsheet: {
    meta: SpreadsheetMetadata
    data: SpreadsheetData
  } | null
  raw_data: {  // TODO: keep that ?
    wotc: WotcExtractedEvent
    spreadsheet?: SpreadsheetRawRow[]
    [key: string]: any
  },
  lastRound: number,
  scrapeStatus: EventScrapeStateDbo,
  lastUpdated: Date
}