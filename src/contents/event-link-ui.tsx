import type { PlasmoCSConfig } from "plasmo";
import React, { useEffect, useState } from "react";

export const config: PlasmoCSConfig = {
  matches: ["https://eventlink.wizards.com/*"],
  run_at: "document_idle"
};

export const getInlineAnchor = () =>
  document.querySelector("div.event-page-header__primary");

const ScrapeButton = () => {
  const [scrapeStatus, setScrapeStatus] = useState("Idle");
  const [scrapedData, setScrapedData] = useState(null);

  const handleScrape = async () => {
    console.log("Sending scrape request to background script");
    setScrapeStatus("Scraping...");

    chrome.runtime.sendMessage({ action: "START_SCRAPE" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else {
        console.log("Scrape started:", response);
      }
    });
  };

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === "SCRAPE_COMPLETE") {
        console.log("Scraping complete. Event data received:", message.data);
        setScrapeStatus("Scrape Complete");
        setScrapedData(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

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
        {scrapeStatus === "Scraping..." ? "Scraping..." : "SCRAPE!"}
      </button>
      {scrapedData && <pre>{JSON.stringify(scrapedData, null, 2)}</pre>}
    </div>
  );
};

export default ScrapeButton;
