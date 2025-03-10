import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"

export interface EventStatusDbo {
  scrape: ScrapeStatus;
  pair: PairStatus;
  fetch: FetchStatus;
  global: GlobalStatus
}