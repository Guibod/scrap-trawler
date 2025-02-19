import { type EventModel } from "~scripts/domain/models/event.model"
import EventEntity from "../../storage/entities/event.entity"
import type { EventSummarizedDbo } from "~scripts/domain/dbos/event.summarized.dbo"
import { FetchStatus, PairStatus, ScrapeStatus } from "~scripts/domain/enums/status.dbo"
import type { EventWriteDbo } from "~scripts/domain/dbos/event.write.dbo"

export default class EventMapper {
  static toDbo(entity: EventEntity): EventModel {
    return {
      id: entity.id,
      name: entity.name,
      date: entity.date,
      organizer: entity.organizer,
      raw_data: entity.raw_data,
      status: EventMapper.inferStatus(entity),
    };
  }

  static toLightDbo(entity: EventEntity): EventSummarizedDbo {
    return {
      id: entity.id,
      name: entity.name,
      date: entity.date,
      organizer: entity.organizer,
      status: EventMapper.inferStatus(entity),
    };
  }

  static toEntity(dbo: EventModel | EventWriteDbo): EventEntity {
    const entity = new EventEntity();
    entity.id = dbo.id;
    entity.name = dbo.name;
    entity.date = dbo.date;
    entity.organizer = dbo.organizer;
    entity.raw_data = dbo.raw_data ?? {}; // Ensure raw_data is always initialized
    entity.last_updated = new Date();
    return entity;
  }

  private static inferStatus(entity: EventEntity): EventModel["status"] {
    let scrape = ScrapeStatus.IN_PROGRESS;

    if (entity.raw_data.wotc.event.status === "ENDED") {
      scrape = ScrapeStatus.COMPLETED;
    }

    return {
      scrape,
      pair: PairStatus.NOT_STARTED,
      fetch: FetchStatus.NOT_STARTED,
    };
  }
}
