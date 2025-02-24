import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getLogger } from "~resources/logging/logger"

const logger = getLogger("sidepanel-toggle")

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  logger.debug("Received toggle side panel message")
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      return chrome.sidePanel.open({ tabId: activeTab.id }).then(() => true);
    }
  })
  return new Promise(() => false)
}

export default handler
