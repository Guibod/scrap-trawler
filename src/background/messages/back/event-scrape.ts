import type { PlasmoMessaging } from "@plasmohq/messaging"
import { eventService } from "../../singletons"
import type { EventModel } from "~/resources/domain/models/event.model"
import { getLogger } from "~/resources/logging/logger"

const logger = getLogger("event-scrape")

type ScrapeEventRequest = {
  eventId: string
}

const handler: PlasmoMessaging.MessageHandler<ScrapeEventRequest, EventModel | null> = async (req, res) => {
  logger.debug("Received scrape_event message", req)
  // await eventService.deleteEvent(req.body.eventId)
}

export default handler