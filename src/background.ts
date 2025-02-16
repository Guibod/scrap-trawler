import { ContentAccessor } from "~scripts/eventlink/content.accessor"
import { type WotcExtractedEvent } from "~scripts/eventlink/event-extractor"
import {
  isAppExtractEventMessage, isAuthTokenRequest, MessageTypes,
  type WorldExtractEventMessage
} from "~scripts/messages/message-types"
import type { ErrorResponse } from "~scripts/messages/error.response"
import { getAccessToken } from "~scripts/eventlink/background.accessor"


console.log("Scrap Trawler background script is running.");

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
            eventId: ContentAccessor.getEventId(message.url),
            organizationId: ContentAccessor.getOrganizationId(message.url),
            accessToken
          } as WorldExtractEventMessage,
          (response: WotcExtractedEvent | ErrorResponse) => {
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