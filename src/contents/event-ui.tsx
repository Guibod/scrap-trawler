import type { PlasmoCSConfig } from "plasmo"
import React from "react"
import { Button } from "@heroui/button";
import {HeroUIProvider} from "@heroui/system";

import {
  type AppExtractEventMessage,
  MessageTypes, type ToggleSidePanelMessage
} from "~scripts/messages/message-types"
import type { WotcExtractedEvent } from "~scripts/eventlink/event-extractor"
import type { ErrorResponse } from "~scripts/messages/error.response"
import { getLogger } from "~scripts/logging/logger"
// import cssText from "data-text:~style.css"
// import "framer-motion"
//
// export const getStyle = () => {
//   const style = document.createElement("style")
//   style.textContent = cssText
//   return style
// }

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

export const getInlineAnchor = () =>
  document.querySelector("div.event-page-header__primary, div.event-view__too-old");

const logger = getLogger('event-ui');
logger.start('Event UI started');

const ScrapeButton = () => {
  const handleToggle = async () => {
    logger.debug("Requested to toggle sidepanel");
    chrome.runtime.sendMessage({ action: MessageTypes.TOGGLE_SIDEPANEL } as ToggleSidePanelMessage);
  }

  const handleScrape = async () => {
    logger.start("Sending scrape request to background script");

    chrome.runtime.sendMessage(
      {
        action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
        url: window.location.href
      } as AppExtractEventMessage,
      (response: WotcExtractedEvent | ErrorResponse) => {
        logger.info("Extraction went right in the service worker", response);
      }
    );
  };

  return (
    <HeroUIProvider disableAnimation={true}>
      <div>
        <Button
          color="primary"
          onPress={handleScrape}
        >
          SCRAPE!
        </Button>

        <Button
          color="secondary"
          onPress={handleToggle}
        >
          TOGGLE SIDEBAR
        </Button>
      </div>
    </HeroUIProvider>
  );
};

export default ScrapeButton;
