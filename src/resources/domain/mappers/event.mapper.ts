import { type EventModel } from "~resources/domain/models/event.model"
import EventEntity from "../../storage/entities/event.entity"
import type { EventSummarizedDbo } from "~resources/domain/dbos/event.summarized.dbo"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"
import { getLogger } from "~resources/logging/logger"
import EventHydrator from "~resources/domain/mappers/event.hydrator"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"
import { mapSpreadsheetData } from "~resources/domain/mappers/spreadsheet.mapper"

const logger = getLogger("event-mapper")

export default class EventMapper {
  static async toDbo(entity: EventEntity): Promise<EventModel> {
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
      players: Object.fromEntries(entity.players.map(player => [player.id, player])),
      teams: Object.fromEntries(entity.teams.map((team) => [team.id, team])),
      rounds: Object.fromEntries(entity.rounds.map(round => [round.roundNumber, {
        ...round,
        matches: Object.fromEntries((round.matches || []).map(match => [match.id, {
          ...match,
          results: Object.fromEntries((match.results || []).map(result => [result.id, result]))
        }])),
        drops: Object.fromEntries((round.drops || []).map(drop => [drop.id, drop])),
        standings: Object.fromEntries((round.standings || []).map(standing => [standing.id, standing])),
      } as RoundDbo])),
      lastRound: EventHydrator.inferLastRound(entity),
      raw_data: entity.raw_data,
      status: EventHydrator.inferStatus(entity),
      lastUpdated: entity.lastUpdated || null,
      scrapeStatus: entity.scrapeStatus,
      mapping: entity.mapping,
      spreadsheet: entity.spreadsheet ? {
        meta: entity.spreadsheet,
        data: await mapSpreadsheetData(entity.raw_data.spreadsheet, entity.spreadsheet) // Store raw spreadsheet data in `data`
      } : null
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
      players: Object.values(dbo.players),
      teams: Object.values(dbo.teams),
      rounds: Object.values(dbo.rounds).map(round => ({
        ...round,
        matches: Object.values(round.matches).map(match => ({
          ...match,
          results: Object.values(match.results)
        })),
        drops: Object.values(round.drops),
        standings: Object.values(round.standings),
      })),
      spreadsheet: dbo.spreadsheet?.meta ?? null,
      mapping: dbo.mapping ?? null,
      date: new Date(dbo.date),
      raw_data: dbo.raw_data ?? {},
      lastUpdated: new Date()
    });

    return entity
  }

}
