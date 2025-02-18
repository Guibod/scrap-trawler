import Dexie, { type EntityTable } from 'dexie';
import EventEntity from '~resources/storage/entities/event.entity';
import { getLogger } from "~resources/logging/logger"

export default class Database extends Dexie {
  readonly logger = getLogger(this.constructor.name);

  events!: EntityTable<EventEntity, 'id'>;

  constructor() {
    super('ScrapTrawlerDB');
    this.version(1).stores({
      events: '++id, name, date'
    });
    this.events.mapToClass(EventEntity);
    this.logger.start("Database initialized.");
  }
}