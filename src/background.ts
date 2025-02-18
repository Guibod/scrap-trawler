import { type WotcExtractedEvent } from "~resources/eventlink/event-extractor"
import {
  isAppExtractEventMessage,
  isAuthTokenRequest,
  MessageTypes,
  isLogMessage,
  isToggleSidePanelMessage,
  type WorldExtractEventMessage,
  isOpenBlankMessage, isGetEventMessage
} from "~resources/messages/message-types"
import { type ErrorResponse, isErrorResponse } from "~resources/messages/error.response"
import { BackgroundAccessor } from "~resources/eventlink/background.accessor"
import { getLogger } from "~resources/logging/logger"
import EventService from "~resources/domain/services/event.service"
const backgroundAccessor = new BackgroundAccessor()

const logger = getLogger("background-service")

logger.start("Background service started");

(async () => {
  const eventService = new EventService();
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => logger.exception(error));

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    logger.debug("Received message in background:", message)

    if (isLogMessage(message)) {
      logger[message.level](`${message.context}: ${message.message}`, message.data)
      return new Promise(() => true)
    }

    if (isOpenBlankMessage(message)) {
      chrome.tabs.create({ url: chrome.runtime.getURL("tabs/blank.html") });
      return new Promise(() => true)
    }

    if (isGetEventMessage(message)) {
      const event = await eventService.getEvent(message.eventId)
      sendResponse(event)
      return new Promise(() => true)
    }

    if (isToggleSidePanelMessage(message)) {
      logger.debug("Received toggle side panel message")
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
          chrome.sidePanel.open({ tabId: activeTab.id });
        }
      })
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
              eventId: message.eventId,
              organizationId: message.organizationId,
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