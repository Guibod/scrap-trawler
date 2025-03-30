import { getLogger } from "~/resources/logging/logger"
import type { EventLinkGraphQLClient } from "~/resources/integrations/eventlink/graphql/client"
import type { GameState, Player } from "~/resources/integrations/eventlink/graphql/types"
import { ScrapeTrigger, type WotcExtractedEvent } from "~/resources/integrations/eventlink/types"
import {
  EventAnonymizationError,
  ScrapeTooSoonError,
  TooOldToScrapeError
} from "~/resources/integrations/eventlink/exceptions"
import { EventDao } from "~/resources/storage/event.dao"
import EventHydrator from "~/resources/storage/hydrators/event.hydrator"
import type EventEntity from "~/resources/storage/entities/event.entity"
import { NotFoundStorageError } from "~/resources/storage/exceptions"

const DEFAULT_MIN_DELAY_MS = 10 * 60 * 1000 // 10 minutes

export class EventScrapeRunner {
  private logger = getLogger("event-scrape")

  constructor(
    private readonly client: EventLinkGraphQLClient,
    private readonly eventDao: EventDao = EventDao.getInstance(),
    private readonly minDelay: number = DEFAULT_MIN_DELAY_MS
  ) {}

  async scrape(eventId: string, orgId: string, trigger: ScrapeTrigger): Promise<EventEntity> {
    const existing = await this.eventDao.get(eventId).catch(e => {
      if (!(e instanceof NotFoundStorageError)) throw e
      return null
    })

    if (trigger === ScrapeTrigger.AUTOMATED && existing?.lastScrapedAt) {
      const elapsed = Date.now() - new Date(existing.lastScrapedAt).getTime()
      if (elapsed < this.minDelay) {
        this.logger.info(`Skipping automated scrape: event ${eventId} scraped ${elapsed / 1000}s ago`)
        throw new ScrapeTooSoonError(eventId)
      }
    }

    const extracted = await this.extract(eventId, orgId)

    if (this.hasAnonymizedUserData(extracted.event.registeredPlayers)) {
      const previouslyNotAnonymized =
        existing &&
        !this.hasAnonymizedUserData(existing.raw_data.wotc.event.registeredPlayers)

      if (previouslyNotAnonymized) {
        const error = new EventAnonymizationError(eventId)
        this.logger.exception(error)
        throw error
      }
    }

    const entity: EventEntity = EventHydrator.hydrate({
      id: extracted.event.id,
      raw_data: { wotc: extracted },
      lastScrapedAt: new Date().toISOString()
    })

    return this.eventDao.save(entity)
  }

  private async extract(eventId: string, orgId: string): Promise<WotcExtractedEvent> {
    const event = await this.client.getEventDetails(eventId)
    const organization = await this.client.getOrganization(orgId)
    const rounds = await this.fetchRounds(eventId)

    const result: WotcExtractedEvent = { event, organization, rounds }

    if (this.hasPurgedData(result)) {
      const error = new TooOldToScrapeError(eventId)
      this.logger.exception(error)
      throw error
    }

    return result
  }

  private async fetchRounds(eventId: string): Promise<Record<number, GameState>> {
    const round1 = await this.client.getGameStateAtRound(eventId, 1)
    const total = round1.currentRoundNumber ?? 1

    const rest = await Promise.all(
      Array.from({ length: total - 1 }, (_, i) => i + 2).map(r =>
        this.client.getGameStateAtRound(eventId, r)
      )
    )

    return {
      1: round1,
      ...Object.fromEntries(rest.map((g, i) => [i + 2, g]))
    }
  }

  private hasAnonymizedUserData(players: Player[]): boolean {
    return players.some(p =>
      [p.firstName, p.lastName, p.displayName].every(v => v === "[REDACTED]")
    )
  }

  private hasPurgedData(data: WotcExtractedEvent): boolean {
    const { event, rounds } = data

    console.log("event", event)
    console.log("rounds", rounds)
    return !rounds?.[1]?.rounds || event.registeredPlayers?.length === 0
  }
}
