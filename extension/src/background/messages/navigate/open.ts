import type { PlasmoMessaging } from "@plasmohq/messaging"

interface OpenRequest {
  path?: string
}

const handler: PlasmoMessaging.MessageHandler<OpenRequest, never> = async (req, res) => {
  await chrome.tabs.create({ url: chrome.runtime.getURL('tabs/main.html#' + req.body.path) });
}

export default handler