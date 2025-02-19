import { EventDao } from "~scripts/storage/event.dao"
import type { EventModel } from "~scripts/domain/models/event.model"
import EventMapper from "~scripts/domain/mappers/event.mapper"
import type { EventSummarizedDbo } from "~scripts/domain/dbos/event.summarized.dbo"
import type { EventWriteDbo } from "~scripts/domain/dbos/event.write.dbo"

export default class EventService {
  private dao = new EventDao();

  async getEvent(id: string): Promise<EventModel | null> {
    const entity = await this.dao.get(id);
    return entity ? EventMapper.toDbo(entity) : null;
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
