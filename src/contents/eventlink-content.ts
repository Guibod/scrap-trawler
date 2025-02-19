import { ContentAccessor } from "~scripts/eventlink/content.accessor";
import { EventExtractor } from "~scripts/eventlink/event-extractor";
import { type BaseMessage, isAppVersionRequest, isWorldExtractEventMessage } from "~scripts/messages/message-types"
import type { PlasmoCSConfig } from "plasmo"
import { ScrapTrawlerError } from "~scripts/exception"
import { getLogger } from "~scripts/logging/logger"

const logger = getLogger("eventlink-content");
logger.start("Content script started");

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

const contentAccessor = new ContentAccessor();
(async () => {
  const wotcClientHeader = await contentAccessor.getXWotcClientHeader();

  chrome.runtime.onMessage.addListener((message: BaseMessage, sender, sendResponse) => {
    if (isAppVersionRequest(message)) {
      sendResponse(wotcClientHeader);
      return true;
    }

    if (isWorldExtractEventMessage(message)) {
      (async () => {
        try {
          const extractor = new EventExtractor(message.accessToken, wotcClientHeader, message.eventId, message.organizationId);
          sendResponse(await extractor.extract());
        } catch (e) {
          if (e instanceof ScrapTrawlerError) {
            sendResponse(e.toErrorResponse());
            console.error(e);
          }
        }
      })();

      return true;
    }

    return false;
  });

  logger.info("Content script initialized with X-WOTC-Client header:", { wotcClientHeader });
})();
