import { ScrapTrawlerError } from "~/resources/exception"

export class GraphQlError extends ScrapTrawlerError {
  constructor(message: string, sourceError?: Error) {
    super(`GraphQL Error: ${message}`, sourceError);
  }
}

export class InvalidGraphQlResponseError extends GraphQlError {
  constructor(sourceError?: Error) {
    super('Received an invalid or malformed GraphQL response.', sourceError);
  }
}

export class UnauthorizedGraphQlError extends GraphQlError {
  constructor(sourceError?: Error) {
    super('Unauthorized access to GraphQL API.', sourceError);
  }
}

export class ScrapingError extends ScrapTrawlerError {
  constructor(message: string, sourceError?: Error) {
    super(`Scraping Error: ${message}`, sourceError);
  }
}

export class TooOldToScrapeError extends ScrapingError {
  constructor(eventId) {
    super(`Event ${eventId} was read but it was almost fully cleaned up by Wizards. It is too old to be properly scrapped.`);
  }
}


export class EventAnonymizationError extends ScrapTrawlerError {
  constructor(eventId: string) {
    super(`Event ${eventId} has anonymized data and would override existing user data. Skipping scrape.`);
  }
}

export class ScrapeTooSoonError extends ScrapTrawlerError {
  constructor(eventId: string) {
    super(`Event ${eventId} was scraped too soon`)
  }
}

export class ExpiredTokenError extends ScrapTrawlerError {
  constructor() {
    super(`Authentication token has expired. You need to be connected to eventlink.`)
  }
}
