import { getXWotcClientHeader } from "~scripts/eventlink/content.accessor";
import { EventExtractor } from "~scripts/eventlink/event-extractor";
import { ErrorResponse } from "~scripts/messages/error.response";
import { isAppVersionRequest, isAuthTokenRequest, isWorldExtractEventMessage } from "~scripts/messages/message-types";
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

const wotcClientHeader = getXWotcClientHeader()

chrome.runtime.onMessage.addListener(async (message: any, sender: chrome.runtime.MessageSender, sendResponse) => {
  console.log("scraper content received a message", message);

  if (isAppVersionRequest(message)) {
    sendResponse(wotcClientHeader);
  }

  if (isWorldExtractEventMessage(message)) {
    const extractor = new EventExtractor(message.accessToken, wotcClientHeader, message.eventId);

    sendResponse(
      await extractor.extract()
        .catch((e) => new ErrorResponse(message.action, sender, e))
    )
  }
});
