import Dexie, { type EntityTable } from 'dexie';
import EventEntity from '~/resources/storage/entities/event.entity';
import { getLogger } from "~/resources/logging/logger";

class DatabaseService {
  private static instance: DatabaseService;
  private readonly db: Dexie;
  private readonly logger = getLogger(this.constructor.name);

  readonly events: EntityTable<EventEntity, 'id'>;

  private constructor() {
    this.db = new Dexie('ScrapTrawlerDB');
    this.db.version(1).stores({
      events: '++id, name, date'
    });

    this.events = this.db.table<EventEntity, 'id'>('events');
    this.events.mapToClass(EventEntity);

    this.logger.start("Database initialized.");
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async open() {
    return this.db.open()
  }
}

export default DatabaseService;
