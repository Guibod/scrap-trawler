import type { PlasmoMessaging } from "@plasmohq/messaging"
import MtgJsonService, { type MtgJsonImportCompletion } from "~/resources/integrations/mtg-json/service"
import { getLogger } from "~/resources/logging/logger"

const logger = getLogger("background")
export interface MtgJsonImportRequest {}

export type MtgJsonImportProgressMessage = {
  type: 'mtgjson-import-progress',
  progress: number
}

export function isMtgJsonImportProgress(
  data: unknown
): data is MtgJsonImportProgressMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as MtgJsonImportProgressMessage).type === "mtgjson-import-progress" &&
    typeof (data as MtgJsonImportProgressMessage).progress === "number"
  )
}

const handler: PlasmoMessaging.MessageHandler<MtgJsonImportRequest, MtgJsonImportCompletion> = async (req, res) => {
  logger.debug("Received mtg-json/import message", req)
  const service = MtgJsonService.getInstance()

  service.onImportProgress(async (progress) => {
    chrome.runtime.sendMessage<MtgJsonImportProgressMessage>({
      type: "mtgjson-import-progress",
      progress
    })
  }, 100)

  try {
    res.send(await service.importFromWebsite())
  } catch (error) {
    logger.error("Failed to import cards from MTG-JSON (without the error)")
    logger.error("Failed to import cards from MTG-JSON", error)
    res.send(null)
  }
}

export default handler