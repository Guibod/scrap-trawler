import { ScrapTrawlerError } from "~scripts/exception"

export class StorageError extends ScrapTrawlerError {
  constructor(message: string) {
    super(`Storage Error: ${message}`);
  }
}

export class DataCorruptionError extends StorageError {
  constructor() {
    super('Stored data appears to be corrupted.');
  }
}

export class StorageQuotaExceededError extends StorageError {
  constructor() {
    super('Storage quota exceeded.');
  }
}
