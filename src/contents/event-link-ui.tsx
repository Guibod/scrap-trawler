import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import {
  type AppExtractEventMessage,
  MessageTypes
} from "~scripts/messages/message-types"
import type { WotcExtractedEvent } from "~scripts/eventlink/event-extractor"
import type { ErrorResponse } from "~scripts/messages/error.response"
import { getLogger } from "~scripts/logging/logger"

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

export const getInlineAnchor = () =>
  document.querySelector("div.event-page-header__primary");

const logger = getLogger('eventlink-ui');
logger.start('Event link UI started');

const ScrapeButton = () => {
  const handleScrape = async () => {
    logger.info("Sending scrape request to background script");

    chrome.runtime.sendMessage(
      {
        action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
        url: window.location.href
      } as AppExtractEventMessage,
      (response: WotcExtractedEvent | ErrorResponse) => {
        logger.info(response);
      }
    );
  };

  // useEffect(() => {
  //   const messageListener = (message: any) => {
  //     if (message.action === "SCRAPE_COMPLETE") {
  //       logger.info("Scraping complete. Event data received:", message.data);
  //       setScrapeStatus("Scrape Complete");
  //       setScrapedData(message.data);
  //     }
  //   };
  //
  //   chrome.runtime.onMessage.addListener(messageListener);
  //   return () => {
  //     chrome.runtime.onMessage.removeListener(messageListener);
  //   };
  // }, []);

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
