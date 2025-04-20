import type { PlasmoMessaging } from "@plasmohq/messaging"
import MtgJsonService from "~/resources/integrations/mtg-json/service"
import { getLogger } from "~/resources/logging/logger"

const logger = getLogger("background")
export interface MtgJsonAbortRequest {}

const handler: PlasmoMessaging.MessageHandler<MtgJsonAbortRequest, boolean> = async (req, res) => {
  logger.debug("Received mtg-json/cancel message", req)

  try {
    const service = MtgJsonService.getInstance()
    service.cancelImport()
    res.send(true)
  } catch (error) {
    logger.error("Failed to cancel import cards")
    res.send(false)
  }
}

export default handler