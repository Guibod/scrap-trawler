import { ScrapTrawlerError } from "~resources/exception"

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
    super(`The event ${eventId} was almost fully cleaned up. It is too old to scrape.`);
  }
}

export class DataLossScrapeError extends ScrapingError {
  constructor(eventId) {
    super(`The event ${eventId} is already stored and would lose data if scraped.`);
  }
}
