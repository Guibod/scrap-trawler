import { EventDao } from "~/resources/storage/event.dao";
import { type EventModel } from "~/resources/domain/models/event.model";
import EventMapper from "~/resources/domain/mappers/event.mapper";
import type { EventSummarizedDbo } from "~/resources/domain/dbos/event.summarized.dbo";
import type { EventWriteDbo } from "~/resources/domain/dbos/event.write.dbo";
import EventEntity, { type DeckEntity, EVENT_ENTITY_VERSION } from "~/resources/storage/entities/event.entity"
import { getLogger } from "~/resources/logging/logger";
import EventHydrator from "~/resources/domain/mappers/event.hydrator";

const logger = getLogger("event-service");

export default class EventService {
  private static instance: EventService;
  private dao: EventDao;

  private constructor(dao: EventDao) {
    this.dao = dao;
  }

  static getInstance(dao: EventDao = EventDao.getInstance()): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService(dao);
    }
    return EventService.instance;
  }

  async get(id: string): Promise<EventModel | null> {
    return this.dao.get(id)
      .then(this.hydrateOldVersion.bind(this))
      .then((entity: EventEntity) => EventMapper.toDbo(entity))
      .catch((e) => {
        logger.warn(`Failed to get event ${id}`, e);
        return null;
      });
  }

  async getSummary(id: string): Promise<EventSummarizedDbo | null> {
    return this.dao.get(id)
      .then(this.hydrateOldVersion.bind(this))
      .then((entity: EventEntity) => EventMapper.toLightDbo(entity))
      .catch((e) => {
        logger.warn(`Failed to get event ${id} summary`, e);
        return null;
      });
  }

  async save(event: EventWriteDbo): Promise<EventModel> {
    const entity = EventMapper.toEntity(event);
    return this.dao.save(entity)
      .then(entity => {
        return EventMapper.toDbo(entity);
      });
  }

  async delete(ids: string[] | 'all'): Promise<void> {
    if (ids === 'all') {
      await this.dao.clear()
        .then(() => logger.info(`Deleted all events`));
      return;
    }

    await this.dao.delete(ids)
      .then(() => logger.info(`Deleted event ${ids}`));
  }

  async listEvents(): Promise<EventSummarizedDbo[]> {
    const entities = await this.dao.getAll();
    return entities.map(EventMapper.toLightDbo);
  }

  /**
   * Hydrates an old version of the event entity.
   *
   * If the entity is outdated, it will be hydrated and saved with the current version.
   *
   * @param entity The entity to hydrate.
   * @returns The hydrated entity.
   */
  async hydrateOldVersion(entity: EventEntity): Promise<EventEntity> {
    if ((entity.version ?? 0) < EVENT_ENTITY_VERSION) {
      logger.warn(`Event ${entity.id} (v${entity.version}) is outdated. Hydrating...`);
      const hydratedEvent = EventHydrator.hydrate(entity);
      logger.debug(`Event ${entity.id} was hydrated into`, hydratedEvent);
      return this.dao.save(hydratedEvent);
    }

    return entity;
  }

  async addDeckToEvent(eventId: any, deck: DeckEntity, raw: any): Promise<EventModel | null> {
    const event = await this.dao.get(eventId);
    if (!event) {
      logger.warn(`Skipping add deck for event ${eventId}: Event not found.`);
      return null;
    }

    if (!event.raw_data) event.raw_data = {} as unknown as EventEntity["raw_data"];
    if (!event.raw_data.fetch) event.raw_data.fetch = {}
    event.raw_data.fetch[deck.id] = raw
    event.decks = event.decks.filter(existingDeck => existingDeck.id !== deck.id);
    event.decks.push(deck);
    await this.dao.save(event);

    return EventMapper.toDbo(event);
  }
}
