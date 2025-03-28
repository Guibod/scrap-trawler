import { getLogger } from "~/resources/logging/logger"
import { type EventModel } from "~/resources/domain/models/event.model"
import EventEntity, { EVENT_ENTITY_VERSION, type RoundEntity } from "~/resources/storage/entities/event.entity"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import { ScrapTrawlerError } from "~/resources/exception"
import { faker } from "@faker-js/faker"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"
import type { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { WotcExtractedEvent } from "~/resources/integrations/eventlink/event-extractor"
import { EventLinkFormats } from "~/resources/integrations/eventlink/enum"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"

const logger = getLogger("event-hydrator")
export class HydrationError extends ScrapTrawlerError {}

type HydratableEntity = Pick<EventEntity, 'id' | 'raw_data'> & Partial<EventEntity>

/**
 * Recompose a Model from raw data
 *
 * It’s a fallback for unrecoverable data in the database.
 */
export default class EventHydrator {
  public static hydrate(entity: HydratableEntity): EventEntity {
    try {
      return EventHydrator._hydrate(entity);
    } catch (error) {
      logger.error(`Failed to hydrate event ${entity.id}`, error);
      throw new HydrationError(`Failed to hydrate event ${entity.id}`);
    }
  }

  protected static _hydrate(entity: HydratableEntity): EventEntity {
    // TODO: do not overwrite existing edited data

    const rawData = entity.raw_data?.wotc as WotcExtractedEvent
    const hydrated: EventEntity = {
      id: rawData.event.id,
      format: EventLinkFormats[rawData.event.eventFormat.name] ?? null,
      scrapeStatus: EventHydrator.inferEventScrapeStatus(entity),
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
      decks: [],
      mapping: entity.mapping ?? null,
      spreadsheet: entity.spreadsheet ?? null,
      date: new Date(rawData.event.actualStartTime ?? rawData.event.scheduledStartTime).toISOString(),
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

  public static inferPlayers(entity: HydratableEntity): PlayerDbo[] {
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
        currentPlayerDbo = entity.players?.find((p) => p.id === player.personaId)
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

  public static inferRounds(entity: HydratableEntity): RoundEntity[] {
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

  public static inferStatus(entity: HydratableEntity): EventModel["status"] {
    try {
      const scrape = this.inferScrapeStatus(entity);
      const pair = this.inferPairStatus(entity);
      const fetch = this.inferFetchStatus(entity);

      const global = this.inferGlobalStatus(scrape, pair, fetch);

      return { global, scrape, pair, fetch };
    } catch (error) {
      logger.error("Failed to infer status:", error);
      return {
        global: GlobalStatus.NOT_STARTED,
        scrape: ScrapeStatus.NOT_STARTED,
        pair: PairStatus.NOT_STARTED,
        fetch: FetchStatus.NOT_STARTED,
      };
    }
  }

  private static inferScrapeStatus(entity: HydratableEntity): ScrapeStatus {
    const wotc = entity.raw_data?.wotc;

    return wotc?.event?.status === "ENDED"
      ? ScrapeStatus.COMPLETED
      : ScrapeStatus.IN_PROGRESS;
  }

  private static inferPairStatus(entity: HydratableEntity): PairStatus {
    if (!entity.raw_data?.spreadsheet) return PairStatus.NOT_STARTED;

    const hasMapping =
      entity.mapping &&
      Object.keys(entity.mapping).length === Object.keys(entity.players).length;

    const hasFinalizedSheet =
      !!entity.spreadsheet?.columns?.length && entity.spreadsheet.finalized;

    return hasMapping && hasFinalizedSheet
      ? PairStatus.COMPLETED
      : PairStatus.PARTIAL;
  }

  private static inferFetchStatus(entity: HydratableEntity): FetchStatus {
    if (!entity.raw_data?.fetch) return FetchStatus.NOT_STARTED;

    const allFetched = Object.values(entity.decks).every(
      (deck) => deck.status === DeckStatus.FETCHED
    );

    return allFetched ? FetchStatus.COMPLETED : FetchStatus.PARTIAL;
  }

  private static inferGlobalStatus(
    scrape: ScrapeStatus,
    pair: PairStatus,
    fetch: FetchStatus
  ): GlobalStatus {
    if (
      scrape === ScrapeStatus.COMPLETED &&
      pair === PairStatus.COMPLETED &&
      fetch === FetchStatus.COMPLETED
    ) {
      return GlobalStatus.COMPLETED;
    }

    if (
      scrape !== ScrapeStatus.NOT_STARTED ||
      pair !== PairStatus.NOT_STARTED ||
      fetch !== FetchStatus.NOT_STARTED
    ) {
      return GlobalStatus.PARTIAL;
    }

    return GlobalStatus.NOT_STARTED;
  }


  static inferLastRound(entity: HydratableEntity) {
    if (Object.values(entity.rounds).length === 0) {
      return 0;
    }
    return Math.max(...Object.values(entity.rounds).map(round => round.roundNumber))
  }

  static inferTeams(entity: HydratableEntity) {
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

  private static inferEventScrapeStatus(entity: HydratableEntity): EventScrapeStateDbo {
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