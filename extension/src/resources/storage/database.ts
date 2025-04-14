import Dexie, { type EntityTable } from 'dexie';
import EventEntity from '~/resources/storage/entities/event.entity';
import CardEntity, { CardLanguage } from "~/resources/storage/entities/card.entity"
import { getLogger } from "~/resources/logging/logger";
import { DatabaseObserver } from "~/resources/storage/database.observer"

class DatabaseService {
  private static instance: DatabaseService;
  private readonly db: Dexie;
  private readonly logger = getLogger(this.constructor.name);
  private readonly observer: DatabaseObserver;

  readonly events: EntityTable<EventEntity, 'id'>;
  readonly cards!: EntityTable<CardEntity, 'name'>;

  private constructor() {
    this.db = new Dexie('ScrapTrawlerDB');
    this.db.version(1).stores({
      events: '++id, name, date',
      cards: `
          name,
          ${Object.values(CardLanguage).map(lang => `localizedNames.${lang}`).join(', ')}
        `
    });

    this.events = this.db.table<EventEntity, 'id'>('events');
    this.events.mapToClass(EventEntity);

    this.cards = this.db.table<CardEntity, 'name'>('cards');
    this.cards.mapToClass(CardEntity);

    this.observer = new DatabaseObserver(this.db.tables);
    this.observer.start()
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
