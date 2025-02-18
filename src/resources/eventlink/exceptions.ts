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
