import { getXWotcClientHeader } from "~scripts/eventlink/content.accessor";
import { EventExtractor } from "~scripts/eventlink/event-extractor";
import { ErrorResponse } from "~scripts/messages/error.response";
import { isAppVersionRequest, isAuthTokenRequest, isWorldExtractEventMessage } from "~scripts/messages/message-types";
import type { PlasmoCSConfig } from "plasmo"
import { EventMapper, EventStorage } from "~scripts/storage/event-storage"

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

const wotcClientHeader = getXWotcClientHeader()

chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (isAppVersionRequest(message)) {
    sendResponse(wotcClientHeader);
    return true;
  }

  if (isWorldExtractEventMessage(message)) {
    (async () => {
      try {
        const extractor = new EventExtractor(message.accessToken, wotcClientHeader, message.eventId, message.organizationId);
        const result = await extractor.extract();

        await EventStorage.save(EventMapper.toDbo(result))

        sendResponse(result);
      } catch (e) {
        sendResponse(new ErrorResponse(message.action, sender, e));
      }
    })();

    return true;
  }

  return false;
});
