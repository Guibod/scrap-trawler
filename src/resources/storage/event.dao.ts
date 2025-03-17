import { getLogger } from "~/resources/logging/logger"
import EventEntity, { isEventEntity } from "~/resources/storage/entities/event.entity"
import type { EntityTable } from "dexie"
import { NotFoundStorageError, WriteStorageError, InvalidFormatError } from "~/resources/storage/exceptions"
import DatabaseService from "~/resources/storage/database"

const logger = getLogger("event-dao")

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
  private static instance: EventDao;
  protected logger = getLogger(this.constructor.name);
  protected table: EntityTable<EventEntity, "id">;

  private constructor(dbService: DatabaseService) {
    this.table = dbService.events;
  }

  static getInstance(dbService: DatabaseService = DatabaseService.getInstance()): EventDao {
    if (!EventDao.instance) {
      EventDao.instance = new EventDao(dbService);
    }
    return EventDao.instance;
  }

  async clear() {
    return this.table.clear()
  }

  /**
   * Saves an extracted event into local storage.
   * Updates the stored data if the event already exists.
   */
  async save(event: EventEntity): Promise<EventEntity> {
    logger.debug("Saving event", event);
    if (!isEventEntity(event)) {
      logger.error("Invalid event format", event);
      throw new InvalidFormatError(event);
    }

    const existing = await this.table.get(event.id);
    if (!existing) {
      this.logger.debug(`Storing event ${event.id}.`);
      const insertedEvent = { ...event, lastUpdated: new Date().toISOString() }
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

  async count(): Promise<number> {
    return this.table.count()
  }

  async countWith(field: keyof EventEntity, values: any[]): Promise<number> {
    let query = this.table.where(field).equals(values[0])

    for (let i = 1; i < values.length; i++) {
      query = query.or(field).equals(values[i])
    }

    return query.count()
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

  /**
   * Stream out all events from the database one by one.
   */
  async *streamOut(eventIds: string[] | null): AsyncGenerator<EventEntity, void, void> {
    try {
      if (!eventIds) {
        eventIds = await this.table.toCollection().primaryKeys();
      }

      for (const id of eventIds) {
        const event = await this.table.get(id);
        if (event) yield event;
      }
    } catch (error) {
      this.logger.error("Failed to stream out events", error);
      throw new Error("Stream out failed");
    }
  }

  /**
   * Stream in events into the database incrementally.
   */
  async streamIn(eventStream: AsyncIterable<EventEntity>): Promise<number> {
    let successes = 0;
    try {
      for await (const event of eventStream) {
        if (!isEventEntity(event)) {
          continue
        }
        await this.table.put(event);
        successes++
      }
    } catch (error) {
      this.logger.error("Failed to stream in events", error);
      throw new Error("Stream in failed");
    }

    if (successes === 0) {
      throw new InvalidFormatError(null);
    }
    return successes
  }
}