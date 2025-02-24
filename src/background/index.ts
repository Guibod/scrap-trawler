import { logger } from "./singletons"

(async () => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => logger.exception(error));


  // chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  //   logger.debug("Received message in background:", message)
  //
  //   if (isToggleSidePanelMessage(message)) {
  //     logger.debug("Received toggle side panel message")
  //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //       const activeTab = tabs[0];
  //       if (activeTab) {
  //         chrome.sidePanel.open({ tabId: activeTab.id });
  //       }
  //     })
  //     return new Promise(() => true)
  //   }
  //
  //   if (isAppExtractEventMessage(message)) {
  //     const accessToken = await backgroundAccessor.getAccessToken()
  //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //       const activeTab = tabs[0]
  //       if (activeTab) {
  //         chrome.tabs.sendMessage(
  //           activeTab.id,
  //           {
  //             action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST,
  //             eventId: message.eventId,
  //             organizationId: message.organizationId,
  //             accessToken
  //           } as WorldExtractEventMessage,
  //           async (response: WotcExtractedEvent | ErrorResponse) => {
  //             if (!isErrorResponse(response)) {
  //               logger.debug("Complete extraction results: ", response)
  //
  //               await eventService.saveEvent({
  //                 id: response.event.id,
  //                 date: new Date(response.event.actualStartTime ?? response.event.scheduledStartTime),
  //                 name: response.event.title,
  //                 organizer: response.organization.name,
  //                 raw_data: {
  //                   wotc: response
  //                 }
  //               })
  //             }
  //             sendResponse(response)
  //           }
  //         )
  //       }
  //     })
  //
  //     return new Promise(() => true)
  //   }
  //
  //   if (isAuthTokenRequest(message)) {
  //
  //     return true
  //   }
  //
  //
  //   logger.debug("Unknown message type:", message)
  //   return true // Keep service worker alive
  // })

})()