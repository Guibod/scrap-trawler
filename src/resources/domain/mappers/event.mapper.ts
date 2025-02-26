import { type EventModel } from "~resources/domain/models/event.model"
import EventEntity from "../../storage/entities/event.entity"
import type { EventSummarizedDbo } from "~resources/domain/dbos/event.summarized.dbo"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"
import { getLogger } from "~resources/logging/logger"
import EventHydrator from "~resources/domain/mappers/event.hydrator"

const logger = getLogger("event-mapper")

export default class EventMapper {
  static toDbo(entity: EventEntity): EventModel {
    return {
      id: entity.id,
      title: entity.title,
      date: entity.date,
      organizer: {
        id: entity.organizer.id,
        name: entity.organizer.name,
        phoneNumber: entity.organizer.phoneNumber,
        emailAddress: entity.organizer.emailAddress,
        location: entity.organizer.location,
        isPremium: entity.organizer.isPremium
      },
      players: entity.players,
      teams: EventHydrator.inferTeams(entity),
      rounds: entity.rounds,
      lastRound: EventHydrator.inferLastRound(entity),
      raw_data: entity.raw_data,
      status: EventHydrator.inferStatus(entity),
      lastUpdated: entity.lastUpdated || null,
      scrapeStatus: entity.scrapeStatus
    };
  }

  static toLightDbo(entity: EventEntity): EventSummarizedDbo {
    return {
      id: entity.id,
      title: entity.title,
      date: entity.date,
      organizer: entity.organizer.name,
      status: EventHydrator.inferStatus(entity),
      lastUpdated: entity.lastUpdated || null,
      scrapeStatus: entity.scrapeStatus
    };
  }

  static toEntity(dbo: EventWriteDbo): EventEntity {
    const entity = new EventEntity();

    Object.assign(entity, {
      ...dbo,
      date: new Date(dbo.date),
      raw_data: dbo.raw_data ?? {},
      lastUpdated: new Date()
    });

    return entity
  }

}
