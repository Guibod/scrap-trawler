import type { PlasmoMessaging } from "@plasmohq/messaging"
import { eventService } from "../../singletons"
import type { EventModel } from "~resources/domain/models/event.model"
import { getLogger } from "~resources/logging/logger"
import type { EventWriteDbo } from "~resources/domain/dbos/event.write.dbo"

const logger = getLogger("event-put")

const handler: PlasmoMessaging.MessageHandler<EventWriteDbo, EventModel | null> = async (req, res): Promise<void> => {
  logger.debug("Received event-put message", req)
  const resp = await eventService.saveEvent(req.body)
  res.send(resp)
  logger.debug("Responded event-put message", resp)
}

export default handler