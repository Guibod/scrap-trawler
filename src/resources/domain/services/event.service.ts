import { EventDao } from "~resources/storage/event.dao"
import type { EventModel } from "~resources/domain/models/event.model"
import EventMapper from "~resources/domain/mappers/event.mapper"
import type { EventSummarizedDbo } from "~resources/domain/dbos/event.summarized.dbo"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"
import type EventEntity from "~resources/storage/entities/event.entity"
import { getLogger } from "~resources/logging/logger"

const logger = getLogger("event-service")

export default class EventService {
  private dao = new EventDao();

  async getEvent(id: string): Promise<EventModel | null> {
    return this.dao.get(id)
      .catch(() => null)
      .then((entity: EventEntity) => EventMapper.toDbo(entity))
  }

  async getSummary(id: string): Promise<EventSummarizedDbo | null> {
    return this.dao.get(id)
      .catch(() => null)
      .then((entity: EventEntity) => EventMapper.toLightDbo(entity))
  }

  async saveEvent(event: EventWriteDbo): Promise<EventModel> {
    const entity = EventMapper.toEntity(event);
    return this.dao.save(entity)
      .then(() => {
        logger.info(`Saved event ${entity.id}`, entity)
        return EventMapper.toDbo(entity)
      });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.dao.delete(id).then(() => logger.info(`Deleted event ${id}`));
  }

  async listEvents(): Promise<EventSummarizedDbo[]> {
    const entities = await this.dao.getAll();
    return entities.map(EventMapper.toLightDbo);
  }
}
