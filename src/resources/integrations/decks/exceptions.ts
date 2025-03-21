import { ScrapTrawlerError } from "~/resources/exception"

export class FetchError extends ScrapTrawlerError {
  constructor(message: string, sourceError?: Error) {
    super(`Fetch Error: ${message}`, sourceError);
  }
}

export class UnresolvedFetcherError extends ScrapTrawlerError {
  constructor(fetcherType: string) {
    super(`Una: ${fetcherType}`);
  }
}