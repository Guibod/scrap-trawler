import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getLogger } from "~resources/logging/logger"

const logger = getLogger("open-blank")

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("tabs/blank.html") });
  res.send(true)
}

export default handler