import { EventDao } from "~resources/storage/event.dao"
import type { EventModel } from "~resources/domain/models/event.model"
import EventMapper from "~resources/domain/mappers/event.mapper"
import type { EventSummarizedDbo } from "~resources/domain/dbos/event.summarized.dbo"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"
import type EventEntity from "~resources/storage/entities/event.entity"

export default class EventService {
  private dao = new EventDao();

  async getEvent(id: string): Promise<EventModel | null> {
    return this.dao.get(id)
      .then((entity: EventEntity) => EventMapper.toDbo(entity))
      .catch(() => null)
  }

  async getSummary(id: string): Promise<EventSummarizedDbo | null> {
    return this.dao.get(id)
      .then((entity: EventEntity) => EventMapper.toLightDbo(entity))
      .catch(() => null)
  }

  async saveEvent(event: EventWriteDbo): Promise<void> {
    const entity = EventMapper.toEntity(event);
    await this.dao.save(entity);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.dao.delete(id);
  }

  async listEvents(): Promise<EventSummarizedDbo[]> {
    const entities = await this.dao.getAll();
    return entities.map(EventMapper.toLightDbo);
  }
}
