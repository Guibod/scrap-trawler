import { type AppExtractEventMessage, MessageTypes } from "~resources/messages/message-types"
import type { WotcExtractedEvent } from "~resources/eventlink/event-extractor"

export const scrapeEvent = async (eventId: string, organizationId: string): Promise<WotcExtractedEvent> => {
  // logger.start("Sending scrape request to background script");
  console.log("Sending scrape request to background script");

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
        eventId,
        organizationId
      } as AppExtractEventMessage,
      (response: WotcExtractedEvent) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      }
    )
  })
};
