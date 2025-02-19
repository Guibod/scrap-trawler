import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~scripts/domain/enums/status.dbo"

export interface EventStatusDbo {
  scrape: ScrapeStatus;
  pair: PairStatus;
  fetch: FetchStatus;
  global: GlobalStatus
}