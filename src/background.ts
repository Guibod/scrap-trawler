import { ContentAccessor } from "~scripts/eventlink/content.accessor"
import { type WotcExtractedEvent } from "~scripts/eventlink/event-extractor"
import {
  isAppExtractEventMessage, isAuthTokenRequest, MessageTypes, isLogMessage, type WorldExtractEventMessage
} from "~scripts/messages/message-types"
import { type ErrorResponse, isErrorResponse } from "~scripts/messages/error.response"
import { BackgroundAccessor } from "~scripts/eventlink/background.accessor"
import { getLogger } from "~scripts/logging/logger"
import EventService from "~scripts/domain/services/event.service"
const backgroundAccessor = new BackgroundAccessor()

const logger = getLogger("background-service")

const eventService = new EventService();
logger.start("Background service started");

(async () => {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    logger.debug("Received message in background:", message)

    if (isLogMessage(message)) {
      logger[message.level](`${message.context}: ${message.message}`, message.data)
      return new Promise(() => true)
    }

    if (isAppExtractEventMessage(message)) {
      const accessToken = await backgroundAccessor.getAccessToken()
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0]
        if (activeTab) {
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST,
              eventId: ContentAccessor.getEventId(message.url),
              organizationId: ContentAccessor.getOrganizationId(message.url),
              accessToken
            } as WorldExtractEventMessage,
            async (response: WotcExtractedEvent | ErrorResponse) => {
              if (!isErrorResponse(response)) {
                logger.debug("Complete extraction results: ", response)

                await eventService.saveEvent({
                  id: response.event.id,
                  date: new Date(response.event.actualStartTime ?? response.event.scheduledStartTime),
                  name: response.event.title,
                  organizer: response.organization.name,
                  raw_data: {
                    wotc: response
                  }
                })
              }
              sendResponse(response)
            }
          )
        }
      })

      return new Promise(() => true)
    }

    if (isAuthTokenRequest(message)) {
      chrome.cookies.get({ url: "https://eventlink.wizards.com", name: "clientAuth" }, (cookie) => {
        if (cookie) {
          sendResponse({ token: cookie.value })
        } else {
          sendResponse({ error: "No auth token found" })
        }
      })
      return true
    }


    logger.debug("Unknown message type:", message)
    return true // Keep service worker alive
  })

})()