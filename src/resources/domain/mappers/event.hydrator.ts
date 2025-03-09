import { getLogger } from "~resources/logging/logger"
import { type EventModel } from "~resources/domain/models/event.model"
import EventEntity, { EVENT_ENTITY_VERSION, type RoundEntity } from "~resources/storage/entities/event.entity"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~resources/domain/enums/status.dbo"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import { ScrapTrawlerError } from "~resources/exception"
import { faker } from "@faker-js/faker"
import { EventScrapeStateDbo } from "~resources/domain/enums/event.scrape.state.dbo"
import type { PlayerStatusDbo } from "~resources/domain/enums/player.status.dbo"
import type { PlayerDbo } from "~resources/domain/dbos/player.dbo"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"

const logger = getLogger("event-hydrator")
export class HydrationError extends ScrapTrawlerError {}

/**
 * Recompose a Model from raw data
 *
 * It’s a fallback for unrecoverable data in the database.
 */
export default class EventHydrator {
  public static hydrate(entity: EventEntity): EventEntity {
    try {
      return EventHydrator._hydrate(entity);
    } catch (error) {
      logger.error(`Failed to hydrate event ${entity.id}`, error);
      throw new HydrationError(`Failed to hydrate event ${entity.id}`);
    }
  }

  protected static _hydrate(entity: EventEntity): EventEntity {
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
      teams: [], // TODO: support real teams
      players: EventHydrator.inferPlayers(entity),
      rounds: EventHydrator.inferRounds(entity),
      mapping: entity.mapping ?? null,
      spreadsheet: entity.spreadsheet ?? null,
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

  public static inferPlayers(entity: EventEntity): PlayerDbo[] {
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

    return entity.raw_data.wotc.event.registeredPlayers.map((player, teamRank)=> {
      const teamId = teamRank + 1; // inferred from registered players index
      let currentPlayerDbo = undefined
      if (!entity.players) {
        currentPlayerDbo = entity.players.find((p) => p.id === player.personaId)
      }
      const currentOverrideDbo = currentPlayerDbo?.overrides || null

      const playerDbo: PlayerDbo = {
        id: player.personaId,
        avatar: null,
        archetype: null,
        isAnonymized: isAnonymized(player.firstName),
        teamId: `${teamId}`,
        tournamentId: player.id,
        firstName: redactedIsNull(player.firstName),
        lastName: redactedIsNull(player.lastName),
        displayName: redactedIsNull(player.displayName),
        tableNumber: player.preferredTableNumber,
        status: player.status as PlayerStatusDbo,
        overrides: currentOverrideDbo
      }
      if (playerDbo.isAnonymized) {
        playerDbo.firstName = faker.person.firstName()
        playerDbo.lastName = faker.person.lastName()
        playerDbo.displayName = faker.internet.displayName(playerDbo)
      }
      return playerDbo

      // TODO: lookup in other tournaments for matching player personaId
      // TODO: support 2HG and other team formats
    })
  }

  public static inferRounds(entity: EventEntity): RoundEntity[] {
    const map: RoundEntity[] = []
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
        drops: gameState.drops || [],
        standings: gameState.rounds[0].standings.map((standing) => ({
          id: standing.teamId,
          rank: standing.rank,
          matchPoints: standing.matchPoints,
          wins: standing.wins,
          draws: standing.draws,
          losses: standing.losses,
          gameWinPercent: standing.gameWinPercent,
          opponentGameWinPercent: standing.opponentGameWinPercent,
          opponentMatchWinPercent: standing.opponentMatchWinPercent,
        })),
        matches: gameState.rounds[0].matches.map((match) => ({
          id: match.matchId,
          isBye: match.isBye,
          teamIds: match.teamIds,
          tableNumber: match.tableNumber,
          results: match.results.map((result) => ({
            id: result.teamId,
            isBye: result.isBye,
            wins: result.wins,
            losses: result.losses,
            draws: result.draws
          }))
        }))
      }
    })

    return Object.values(map)
  }

  public static inferStatus(entity: EventEntity): EventModel["status"] {
    const wotcData = entity.raw_data.wotc
    const spreadsheetData = entity.raw_data.spreadsheet

    let global = GlobalStatus.NOT_STARTED;
    let scrape = ScrapeStatus.IN_PROGRESS;
    let pair = PairStatus.NOT_STARTED;
    let fetch = FetchStatus.NOT_STARTED;

    try {
      if (wotcData.event.status === "ENDED") {
        scrape = ScrapeStatus.COMPLETED;
        global = GlobalStatus.PARTIAL;
      }

      if (spreadsheetData) {
        pair = PairStatus.PARTIAL

        if (entity.mapping && entity.spreadsheet.columns.length && entity.spreadsheet.finalized) {
          pair = PairStatus.COMPLETED
        }
      }

      if (scrape === ScrapeStatus.COMPLETED && pair === PairStatus.COMPLETED) {
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

  static inferLastRound(entity: EventEntity) {
    if (Object.values(entity.rounds).length === 0) {
      return 0;
    }
    return Math.max(...Object.values(entity.rounds).map(round => round.roundNumber))
  }

  static inferTeams(entity: EventEntity) {
    // TODO: support real teams
    return entity.players.map((player) => ({
      status: undefined,
      tableNumber: null,
      displayName: player.displayName,
      id: player.teamId,
      players: [
        player.id
      ]
    }))
  }

  private static inferScrapeStatus(entity: EventEntity): EventScrapeStateDbo {
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

    if (entity.raw_data.wotc.event.registeredPlayers[0].displayName === "[REDACTED]") {
      return EventScrapeStateDbo.ANONYMIZED
    }

    if (entity.raw_data.wotc.event.actualEndTime === null) {
      return EventScrapeStateDbo.LIVE
    }

    return EventScrapeStateDbo.COMPLETE
  }
}