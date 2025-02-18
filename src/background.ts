import { ContentAccessor } from "~scripts/eventlink/content.accessor"
import { type WotcExtractedEvent } from "~scripts/eventlink/event-extractor"
import {
  isAppExtractEventMessage, isAuthTokenRequest, MessageTypes, isLogMessage, type WorldExtractEventMessage
} from "~scripts/messages/message-types"
import type { ErrorResponse } from "~scripts/messages/error.response"
import { BackgroundAccessor } from "~scripts/eventlink/background.accessor"
import { getLogger } from "~scripts/logging/logger"

const backgroundAccessor = new BackgroundAccessor();

const logger = getLogger("background-service");
logger.start("Background service started");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.debug("Received message in background:", message);

  if (isLogMessage(message)) {
    logger[message.level](`${message.context}: ${message.message}`, message.data);
    return new Promise(() => true);
  }

  if (isAppExtractEventMessage(message)) {
    const accessToken = await backgroundAccessor.getAccessToken();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.tabs.sendMessage(
          activeTab.id,
          {
            action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST,
            eventId: ContentAccessor.getEventId(message.url),
            organizationId: ContentAccessor.getOrganizationId(message.url),
            accessToken
          } as WorldExtractEventMessage,
          (response: WotcExtractedEvent | ErrorResponse) => {
            logger.debug("Complete extraction results: ", response);
            sendResponse(response);
          }
        );
      }
    });

    return new Promise(() => true);
  }

  if (isAuthTokenRequest(message)) {
    chrome.cookies.get({ url: "https://eventlink.wizards.com", name: "clientAuth" }, (cookie) => {
      if (cookie) {
        sendResponse({ token: cookie.value });
      } else {
        sendResponse({ error: "No auth token found" });
      }
    });
    return true;
  }


  logger.debug("Unknown message type:", message);
  return true; // Keep service worker alive
});