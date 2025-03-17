import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { EventModel } from "~/resources/domain/models/event.model"
import { getLogger } from "~/resources/logging/logger"
import EventService from "~/resources/domain/services/event.service"

const logger = getLogger("delete_event")

type DeleteEventRequest = {
  eventId: string
}

const handler: PlasmoMessaging.MessageHandler<DeleteEventRequest, EventModel | null> = async (req, res) => {
  logger.debug("Received delete_event message", req)
  await EventService.getInstance().delete(req.body.eventId)
}

export default handler