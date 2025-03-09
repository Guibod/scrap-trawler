import { ScrapTrawlerError } from "~resources/exception"
import type { EntityTable } from "dexie"

export class StorageError extends ScrapTrawlerError {
  constructor(message: string, sourceError?: Error) {
    super(`Storage Error: ${message}`, sourceError);
  }
}

export class NotFoundStorageError extends StorageError {
  constructor(entity: EntityTable<any, any>, identifier: any) {
    super(`Unable to resolve ${entity.name} with ${identifier} in storage.`);
  }
}

export class WriteStorageError extends StorageError {
  constructor(entity: object, sourceError?: Error) {
    super(`Unable to write ${JSON.stringify(entity)}.`, sourceError);
  }
}

export class InvalidFormatError extends StorageError {
  constructor(entity: object = null, sourceError?: Error) {
    super("Invalid format.", sourceError);
  }
}

