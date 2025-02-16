import { getEventId, getOrganizationId } from "~scripts/eventlink/content.accessor"
import { EventExtractor, type ExtractedEvent } from "~scripts/eventlink/event-extractor"
import {
  isAppExtractEventMessage, isAuthTokenRequest,
  type WorldExtractEventMessage
} from "~scripts/messages/message-types"
import { MessageTypes } from "~scripts/messages/messages"
import type { ErrorResponse } from "~scripts/messages/error.response"
import { getAccessToken, getAuthCookie } from "~scripts/eventlink/background.accessor"





console.log("Scrap Trawler background script is running.");

const scrapers: Map<number, EventExtractor> = new Map();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Received message in background:", message);

  if (isAppExtractEventMessage(message)) {
    const accessToken = await getAccessToken();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.tabs.sendMessage(
          activeTab.id,
          {
            action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST,
            eventId: getEventId(message.url),
            organizationId: getOrganizationId(message.url),
            accessToken
          } as WorldExtractEventMessage,
          (response: ExtractedEvent | ErrorResponse) => {
            console.log("Complete extraction results: ", response);
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


  console.log("Unknown message type:", message);
  return true; // Keep service worker alive
});