import { getLogger } from "~resources/logging/logger"
import { singleton as defaultDb } from "~resources/storage/singleton";
import Database from "~resources/storage/database"
import type EventEntity from "~resources/storage/entities/event.entity"
import type { EntityTable } from "dexie"
import { NotFoundStorageError, WriteStorageError } from "~resources/storage/exceptions"
import { NotYetImplemented } from "~resources/exception"

/**
 * Minimal format for listing events.
 */
export interface EventSummary {
  id: string;
  name: string;
  date: Date;
  organizer: string;
}

export class EventDao {
  protected logger = getLogger(this.constructor.name);
  protected table: EntityTable<EventEntity, "id">;

  constructor(db?: Database) {
    if (!db) {
      db = defaultDb;
    }
    this.table = db.events;
  }

  /**
   * Saves an extracted event into local storage.
   * Updates the stored data if the event already exists.
   */
  async save(event: EventEntity): Promise<EventEntity> {
    const existing = await this.table.get(event.id);
    if (!existing) {
      this.logger.debug(`Storing event ${event.id}.`);
      const insertedEvent = { ...event, last_updated: new Date() }
      return this.table.put(insertedEvent).then(id => {
        this.logger.debug(`Event ${event.id} stored with id ${id}.`);
        return { ...insertedEvent, id }
      }).catch((error) => {
        this.logger.exception(error);
        throw new WriteStorageError(event, error);
      })
    }

    this.logger.debug(`Event ${event.id} already exists. Updating data.`);
    const updatedEvent = {
      ...existing,
      ...event,
      last_updated: new Date()
    }

    return this.table.update(event.id, updatedEvent).then(modified => {
      if (modified === 0) {
        throw new Error('Nothing was updated');
      }
      return updatedEvent;
    }).catch((error) => {
      this.logger.exception(error);
      throw new WriteStorageError(event, error);
    })
  }

  /**
   * Retrieves an extracted event from local storage.
   */
  async get(id: string): Promise<EventEntity> {
    return this.table.where({id: id}).first().then((event) => {
      if (typeof event === 'undefined') {
        throw new NotFoundStorageError(this.table, id);
      }
      return event;
    });
  }

  async getAll(): Promise<EventEntity[]> {
    return this.table.orderBy('date').toArray();
  }

  async delete(id: string) {
    return this.table.delete(id)
  }
}