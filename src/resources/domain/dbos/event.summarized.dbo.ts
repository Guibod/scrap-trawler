import type { EventStatusDbo } from './status.dbo';
import type { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"

export interface EventSummarizedDbo {
  id: string;
  title: string;
  date: Date;
  organizer: string;
  status: EventStatusDbo;
  lastUpdated: Date | null;
  scrapeStatus: EventScrapeStateDbo;
}
