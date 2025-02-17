import { ScrapTrawlerError } from "~scripts/exception"

export class GraphQlError extends ScrapTrawlerError {
  constructor(message: string) {
    super(`GraphQL Error: ${message}`);
  }
}

export class InvalidGraphQlResponseError extends GraphQlError {
  constructor() {
    super('Received an invalid or malformed GraphQL response.');
  }
}

export class UnauthorizedGraphQlError extends GraphQlError {
  constructor() {
    super('Unauthorized access to GraphQL API.');
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
  constructor(message: string) {
    super(`Scraping Error: ${message}`);
  }
}

export class EventLinkParsingError extends ScrapingError {
  constructor() {
    super('Failed to parse EventLink page structure.');
  }
}

export class AuthenticationRequiredError extends ScrapingError {
  constructor() {
    super('Scraping requires authentication but no valid session was found.');
  }
}