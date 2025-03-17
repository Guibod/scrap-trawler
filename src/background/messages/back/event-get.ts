import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { EventModel } from "~/resources/domain/models/event.model"
import { getLogger } from "~/resources/logging/logger"
import EventService from "~/resources/domain/services/event.service"

const logger = getLogger("event-get")

type GetEventRequest = {
  eventId: string
}

const handler: PlasmoMessaging.MessageHandler<GetEventRequest, EventModel | null> = async (req, res) => {
  logger.debug("Received event-get message", req)
  const resp = await EventService.getInstance().get(req.body.eventId)
  res.send(resp)
  logger.debug("Responded event-get message", resp)
}

export default handler