import { EventDao } from "~/resources/storage/event.dao";
import { type EventModel } from "~/resources/domain/models/event.model";
import EventMapper from "~/resources/domain/mappers/event.mapper";
import type { EventSummarizedDbo } from "~/resources/domain/dbos/event.summarized.dbo";
import type { EventWriteDbo } from "~/resources/domain/dbos/event.write.dbo";
import EventEntity, { EVENT_ENTITY_VERSION } from "~/resources/storage/entities/event.entity";
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

  async delete(id: string): Promise<void> {
    await this.dao.delete(id).then(() => logger.info(`Deleted event ${id}`));
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
}
