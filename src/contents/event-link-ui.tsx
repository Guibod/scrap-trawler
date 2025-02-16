import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { MessageTypes } from "~scripts/messages/messages"
import type { AppExtractEventMessage, WorldExtractEventMessage } from "~scripts/messages/message-types"
import { getEventId } from "~scripts/eventlink/content.accessor"
import type { ExtractedEvent } from "~scripts/eventlink/event-extractor"
import type { ErrorResponse } from "~scripts/messages/error.response"


export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

export const getInlineAnchor = () =>
  document.querySelector("div.event-page-header__primary");

const ScrapeButton = () => {
  const handleScrape = async () => {
    console.log("Sending scrape request to background script");

    chrome.runtime.sendMessage(
      {
        action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
        url: window.location.href
      } as AppExtractEventMessage,
      (response: ExtractedEvent | ErrorResponse) => {
        console.log(response);
      }
    );
  };

  // useEffect(() => {
  //   const messageListener = (message: any) => {
  //     if (message.action === "SCRAPE_COMPLETE") {
  //       console.log("Scraping complete. Event data received:", message.data);
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
