import type { PlasmoMessaging } from "@plasmohq/messaging"
import { eventService } from "../../singletons"
import type { EventModel } from "~resources/domain/models/event.model"
import { getLogger } from "~resources/logging/logger"
import type EventEntity from "~resources/storage/entities/event.entity"
import EventMapper from "~resources/domain/mappers/event.mapper"

const logger = getLogger("event-put")

// Note: We receive a EventEntity because it supports json serialization
const handler: PlasmoMessaging.MessageHandler<EventEntity, EventModel | null> = async (req, res): Promise<void> => {
  logger.debug("Received event-put message", req)
  const dbo = await EventMapper.toDbo(req.body)
  const resp = await eventService.saveEvent(dbo)
  res.send(resp)
  logger.debug("Responded event-put message", resp)
}

export default handler