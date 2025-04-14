export class ScrapTrawlerError extends Error {
  public sourceError?: Error;

  constructor(message: string, sourceError?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.sourceError = sourceError;
  }
}

export class NotYetImplemented extends ScrapTrawlerError {
  constructor(message: string) {
    super('Not Yet Implemented: ' + message);
  }
}
