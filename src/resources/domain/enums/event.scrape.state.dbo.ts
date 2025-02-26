export enum EventScrapeStateDbo {
  /** The tournament is live, meaning we should regularly pull data from it */
  LIVE = "live",

  /** The tournament has ended, and all data is fresh and fully usable */
  COMPLETE = "complete",

  /** The tournament contenders were anonymized after a few weeks */
  ANONYMIZED = "anonymized",

  /** The tournament was emptied of meaningful content, no rounds can be recovered */
  PURGED = "purged",
}