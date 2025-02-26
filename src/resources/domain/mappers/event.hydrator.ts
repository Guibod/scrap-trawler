import { getLogger } from "~resources/logging/logger"
import { type EventModel } from "~resources/domain/models/event.model"
import EventEntity, { EVENT_ENTITY_VERSION } from "~resources/storage/entities/event.entity"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~resources/domain/enums/status.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { RoundDbo } from "~resources/domain/dbos/round.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import type { Drop } from "~resources/eventlink/graphql.dto.types"
import type { DropDbo } from "~resources/domain/dbos/drop.dbo"
import type { MatchDbo } from "~resources/domain/dbos/match.dbo"
import type { ResultDbo } from "~resources/domain/dbos/result.dbo"
import { ScrapTrawlerError } from "~resources/exception"
import type { TeamDbo } from "~resources/domain/dbos/team.dbo"
import type { StandingDbo } from "~resources/domain/dbos/standing.dbo"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"
import { faker } from "@faker-js/faker"
import { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo"

const logger = getLogger("event-hydrator")
export class HydrationError extends ScrapTrawlerError {}

type HydratableEvent = EventEntity | EventWriteDbo | EventModel

/**
 * Recompose a Model from raw data
 *
 * It’s a fallback for unrecoverable data in the database.
 */
export default class EventHydrator {
  public static hydrate(entity: HydratableEvent): EventEntity {
    try {
      return EventHydrator._hydrate(entity);
    } catch (error) {
      logger.error(`Failed to hydrate event ${entity.id}`, error);
      throw new HydrationError(`Failed to hydrate event ${entity.id}`);
    }
  }

  protected static _hydrate(entity: HydratableEvent): EventEntity {
    // TODO: do not overwrite existing edited data

    const rawData = entity.raw_data.wotc as WotcExtractedEvent
    const hydrated: EventEntity = {
      id: rawData.event.id,
      scrapeStatus: EventHydrator.inferScrapeStatus(entity),
      organizer: {
        id: rawData.organization.id,
        name: rawData.organization.name,
        phoneNumber: rawData.organization.phoneNumber,
        emailAddress: rawData.organization.emailAddress,
        location: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              rawData.organization.longitude,
              rawData.organization.latitude
            ]
          },
          properties: {
            address: rawData.organization.postalAddress
          }
        },
        isPremium: rawData.organization.isPremium
      },
      teams: {},
      players: EventHydrator.inferPlayers(entity),
      rounds: EventHydrator.inferRounds(entity),
      date: new Date(rawData.event.actualStartTime ?? rawData.event.scheduledStartTime),
      title: rawData.event.title,
      raw_data: { // raw data is to be preserved
        ...entity.raw_data
      },
      version: EVENT_ENTITY_VERSION,
      lastUpdated: entity.lastUpdated ?? null
    }

    return {
      ...hydrated,
      teams: EventHydrator.inferTeams(hydrated)
    }
  }

  public static inferPlayers(entity: HydratableEvent): Record<PlayerDbo["id"], PlayerDbo> {
    const isAnonymized = (value: string): boolean => {
      if (value === null || value.startsWith("[") && value.endsWith("]")) {
        return true
      }
      return false;
    }
    const redactedIsNull = (value: string): string | null => {
      if (isAnonymized(value)) {
        return null
      }
      return value.trim()
    }

    const rawData = entity.raw_data.wotc as WotcExtractedEvent
    const map = {}
    rawData.event.registeredPlayers.forEach((player, teamRank)=> {
      const teamId = teamRank + 1; // inferred from registered players index
      const playerDbo = {
        id: player.personaId,
        archetype: null,
        isAnonymized: isAnonymized(player.firstName),
        teamId,
        tournamentId: player.id,
        firstName: redactedIsNull(player.firstName),
        lastName: redactedIsNull(player.lastName),
        displayName: redactedIsNull(player.displayName),
        tableNumber: player.preferredTableNumber,
        status: player.status
      }
      if (playerDbo.isAnonymized) {
        playerDbo.firstName = faker.person.firstName()
        playerDbo.lastName = faker.person.lastName()
        playerDbo.displayName = faker.internet.displayName(playerDbo)
      }
      map[player.personaId] = playerDbo

      // TODO: lookup in other tournaments for matching player personaId
      // TODO: support 2HG and other team formats
    })

    return map
  }

  public static inferRounds(entity: HydratableEvent): Record<number, RoundDbo> {
    const map: Record<number, RoundDbo> = {}
    const rawData = entity.raw_data.wotc as WotcExtractedEvent

    Object.entries(rawData.rounds).forEach(([round, gameState]) => {
      if (!gameState.rounds) {
        // Most probably a draft round or something like that
        return
      }

      map[round] = {
        id: gameState.rounds[0].roundId,
        roundNumber: gameState.rounds[0].roundNumber,
        isFinalRound: gameState.rounds[0].isFinalRound,
        isPlayoff: gameState.rounds[0].isPlayoff,
        isCertified: gameState.rounds[0].isCertified,
        pairingStrategy: gameState.rounds[0].pairingStrategy,
        drops: gameState.drops?.reduce((acc: Record<string, DropDbo>, drop: Drop) => {
          acc[drop.teamId] = {
            roundNumber: drop.roundNumber,
            teamId: drop.teamId
          }
          return acc
        }, {} as Record<string, DropDbo>),
        standings: gameState.rounds[0].standings?.reduce((acc: Record<string, StandingDbo>, standing) => {
          acc[standing.rank] = {
            id: standing.teamId,
            rank: standing.rank,
            matchPoints: standing.matchPoints,
            wins: standing.wins,
            draws: standing.draws,
            losses: standing.losses,
            gameWinPercent: standing.gameWinPercent,
            opponentGameWinPercent: standing.opponentGameWinPercent,
            opponentMatchWinPercent: standing.opponentMatchWinPercent,
          }
          return acc
        }, {} as Record<string, StandingDbo>),
        matches: gameState.rounds[0].matches?.reduce((acc: Record<string, MatchDbo>, match) => {
          acc[match.matchId] = {
            id: match.matchId,
            isBye: match.isBye,
            teamIds: match.teamIds,
            tableNumber: match.tableNumber,
            results: match.results.reduce((acc: Record<string, ResultDbo>, result) => {
              acc[result.teamId] = {
                isBye: result.isBye,
                wins: result.wins,
                losses: result.losses,
                draws: result.draws
              }
              return acc
            }, {} as Record<string, ResultDbo>)
          }
          return acc
        }, {} as Record<string, MatchDbo>)
      }
    })

    return map
  }

  public static inferStatus(entity: HydratableEvent): EventModel["status"] {
    const rawData = entity.raw_data.wotc as WotcExtractedEvent

    let global = GlobalStatus.NOT_STARTED;
    let scrape = ScrapeStatus.IN_PROGRESS;
    let pair = PairStatus.NOT_STARTED;
    let fetch = FetchStatus.NOT_STARTED;

    try {
      if (rawData.event.status === "ENDED") {
        scrape = ScrapeStatus.COMPLETED;
        global = GlobalStatus.PARTIAL;
      }

      if (scrape === ScrapeStatus.COMPLETED) {
        global = GlobalStatus.COMPLETED;
      }
    } catch (error) {
      logger.error("Failed to infer status:", error);
    }

    return {
      global,
      scrape,
      pair,
      fetch,
    };
  }

  static inferLastRound(entity: HydratableEvent) {
    if (Object.values(entity.rounds).length === 0) {
      return 0;
    }
    return Math.max(...Object.values(entity.rounds).map(round => round.roundNumber))
  }

  static inferTeams(entity: HydratableEvent) {
    const map : Record<string, TeamDbo> = {}

    // TODO: support real teams
    Object.values(entity.players).forEach(player => {
      if (!map[player.teamId]) {
        map[player.teamId] = {
          status: undefined,
          tableNumber: null,
          displayName: player.displayName,
          id: player.teamId,
          players: []
        }
      }
      map[player.teamId].players.push(player.id)
    })

    return map
  }

  private static inferScrapeStatus(entity: HydratableEvent): EventScrapeStateDbo {
    if (!entity.raw_data.wotc.rounds) {
      return EventScrapeStateDbo.PURGED
    }

    if (Object.values(entity.raw_data.wotc.rounds).reduce((acc, round) => {
      if (!round?.rounds) {
        return acc
      }
      return acc + round.rounds.length
      }, 0) === 0) {
      return EventScrapeStateDbo.PURGED
    }

    console.log(entity.raw_data.wotc.event.registeredPlayers)
    if (entity.raw_data.wotc.event.registeredPlayers[0].displayName === "[REDACTED]") {
      return EventScrapeStateDbo.ANONYMIZED
    }

    if (entity.raw_data.wotc.event.actualEndTime === null) {
      return EventScrapeStateDbo.LIVE
    }

    return EventScrapeStateDbo.COMPLETE
  }
}