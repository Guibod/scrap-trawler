import { getLogger } from "~scripts/logging/logger"
import { singleton as defaultDb } from "~scripts/storage/singleton";
import Database from "~scripts/storage/database"
import type EventEntity from "~scripts/storage/entities/event.entity"
import type { EntityTable } from "dexie"
import { NotFoundStorageError, WriteStorageError } from "~scripts/storage/exceptions"

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
  async get(eventId: number): Promise<EventEntity> {
    return this.table.where({id: eventId}).first().then((event) => {
      if (typeof event === 'undefined') {
        throw new NotFoundStorageError(this.table, eventId);
      }
      return event;
    });
  }

  /**
   * Lists all stored events in a minimal format (id & name).
   */
  async summary(): Promise<EventSummary[]> {
    return (await this.table.orderBy('date').toArray()).map((event) => ({
          id: event.id,
          name: event.name,
          organizer: event.organizer,
          date: event.date
        }));
  }
}