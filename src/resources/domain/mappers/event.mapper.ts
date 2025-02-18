import { type EventModel } from "~resources/domain/models/event.model"
import EventEntity from "../../storage/entities/event.entity"
import type { EventSummarizedDbo } from "~resources/domain/dbos/event.summarized.dbo"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~resources/domain/enums/status.dbo"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"

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
    let global = GlobalStatus.NOT_STARTED;
    let scrape = ScrapeStatus.IN_PROGRESS;
    let pair = PairStatus.NOT_STARTED;
    let fetch = FetchStatus.NOT_STARTED;

    if (entity.raw_data.wotc.event.status === "ENDED") {
      scrape = ScrapeStatus.COMPLETED;
      global = GlobalStatus.PARTIAL;
    }

    if (scrape === ScrapeStatus.COMPLETED) {
      global = GlobalStatus.COMPLETED;
    }

    return {
      global,
      scrape,
      pair,
      fetch,
    };
  }
}
