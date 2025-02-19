import type { PlasmoCSConfig } from "plasmo"
import React from "react"

import {
  type AppExtractEventMessage,
  MessageTypes
} from "~scripts/messages/message-types"
import { getLogger } from "~scripts/logging/logger"

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/stores/*/events/*"],
  run_at: "document_idle"
};

export const getInlineAnchor = () =>
  document.querySelector("div.event-page-header__primary, div.event-view__too-old");

const logger = getLogger('event-ui');
logger.start('Event UI started');

const ScrapeButton = () => {
  const handleScrape = async () => {
    logger.info("Sending scrape request to background script");

    chrome.runtime.sendMessage(
      {
        action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
        url: window.location.href
      } as AppExtractEventMessage,
    );
  };

  return (
    <div>
      <button
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          marginLeft: "10px"
        }}
        onClick={handleScrape}
      >
        SCRAPE!
      </button>
    </div>
  );
};

export default ScrapeButton;
