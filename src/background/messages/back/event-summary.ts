import type { PlasmoMessaging } from "@plasmohq/messaging"
import { eventService } from "../../singletons"
import { getLogger } from "~resources/logging/logger"
import type { EventSummarizedDbo } from "~resources/domain/dbos/event.summarized.dbo"

const logger = getLogger("event-summary")

type GetEventRequest = {
  eventId: string
}

const handler: PlasmoMessaging.MessageHandler<GetEventRequest, EventSummarizedDbo | null> = async (req, res) => {
  logger.debug("Received get_event message", req)
  res.send(await eventService.getSummary(req.body.eventId))
}

export default handler