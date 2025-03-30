// noinspection ExceptionCaughtLocallyJS

import { type PlasmoMessaging } from "@plasmohq/messaging"
import { EventScrapeRunner } from "~/resources/integrations/eventlink/event.scrape.runner"
import { EventLinkGraphQLClient } from "~/resources/integrations/eventlink/graphql/client"
import { ScrapeTrigger } from "~/resources/integrations/eventlink/types"
import { getLogger } from "~/resources/logging/logger"
import { getAuthToken, getClientHeader, isJwtExpired } from "~/resources/integrations/eventlink/utils"
import { ExpiredTokenError, ScrapingError } from "~/resources/integrations/eventlink/exceptions"
import type { EventModel } from "~/resources/domain/models/event.model"
import EventMapper from "~/resources/domain/mappers/event.mapper"

const logger = getLogger("event-scrape")

export type ScrapeRequest = {
  eventId: string
  organizationId: string
  trigger: ScrapeTrigger
}

type ErrorResponse = {
  error: {
    message: string,
    sourceError?: Error
  }
}

export function isScrapeResponseError(value: unknown): value is ErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as any).error?.message === "string"
  )
}

export type ScrapeResponse = EventModel | ErrorResponse

const handler: PlasmoMessaging.MessageHandler<ScrapeRequest, ScrapeResponse> = async (req, res) => {
  const { eventId, organizationId, trigger } = req.body

  try {
    if (!eventId || !organizationId || !Object.values(ScrapeTrigger).includes(trigger)) {
      throw new ScrapingError("Invalid request body")
    }

    const [token, clientHeader] = await Promise.all([getAuthToken(), getClientHeader()])
      .catch((e) => {
        throw new ScrapingError("Failed to get auth token or client header", e)
      })

    if (!token || isJwtExpired(token)) {
      throw new ExpiredTokenError()
    }

    const client = new EventLinkGraphQLClient(token, clientHeader)
    const runner = new EventScrapeRunner(client)

    const entity = await runner.scrape(eventId, organizationId, ScrapeTrigger[trigger])
    const event = await EventMapper.toDbo(entity)
    logger.info(`Scrape succeeded for ${eventId}`)
    res.send(event)
  } catch (e) {
    logger.exception(e)
    res.send({ error: { message: e instanceof Error ? e.message : String(e), sourceError: e }})
  }
}

export default handler
