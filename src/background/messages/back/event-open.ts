import type { PlasmoMessaging } from "@plasmohq/messaging"

interface EventOpenRequest {
  eventId: string
}

const handler: PlasmoMessaging.MessageHandler<EventOpenRequest, never> = async (req, res) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('tabs/main.html#/event/' + req.body.eventId) });
}

export default handler