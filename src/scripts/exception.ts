import type { ErrorResponse } from "~scripts/messages/error.response"

export class ScrapTrawlerError extends Error {
  public sourceError?: Error;

  constructor(message: string, sourceError?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.sourceError = sourceError;
  }

  toErrorResponse(): ErrorResponse {
    return {
      error: this.message,
      type: this.name,
    };
  }
}

