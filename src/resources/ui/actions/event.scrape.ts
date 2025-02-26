import { EventExtractor } from "~resources/eventlink/event-extractor"
import { sendToBackground } from "@plasmohq/messaging"
import type { EventModel } from "~resources/domain/models/event.model"
import EventHydrator from "~resources/domain/mappers/event.hydrator"
import { DataLossScrapeError, TooOldToScrapeError } from "~resources/eventlink/exceptions"
import { getLogger } from "~resources/logging/logger"

const logger = getLogger("event-scrape-action")

export const eventScrape   = async (eventId: string, organizationId: string, alreadyStored = false): Promise<EventModel> => {
  const accessToken = await sendToBackground({
    name: "back/get_auth_token"
  })
  const clientHeader = await sendToBackground({
    name: "back/get-client-header"
  })

  const extractor = new EventExtractor(accessToken, clientHeader, eventId, organizationId);
  const extracted = await extractor.extract();

  if (!extracted.rounds[1].rounds === null) {
    logger.exception(new TooOldToScrapeError(eventId))
    throw new TooOldToScrapeError(eventId)
  }

  if (!extracted.event.registeredPlayers.length && alreadyStored) {
    logger.exception(new DataLossScrapeError(eventId))
    throw new DataLossScrapeError(eventId)
  }

  const body: EventModel = EventHydrator.hydrate({
    id: extracted.event.id,
    raw_data: {
      wotc: extracted
    },
  })

  return sendToBackground({
    name: "back/event-put",
    body
  })
};
