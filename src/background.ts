import { isScrapeUrlMessage, isScrapeStartMessage, isScrapeUrlCompletedMessage } from "~scripts/types/message-types"
import { EventScraper } from "~scripts/event-scraper"

console.log("Scrap Trawler background script is running.");

const scrapers: Map<string, EventScraper> = new Map();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Received message in background:", message);

  if (isScrapeStartMessage(message)) {
     const currentTab = await chrome.tabs.query({ active: true, currentWindow: true })

    const scraper = new EventScraper(message.url, currentTab[0].id);
    scrapers.set(scraper.url, scraper);

    scraper.scrap();
    sendResponse({ status: "Scrape initiated" });
    return new Promise(() => true);
  }

  console.log("Unknown message type:", message);
  return true; // Keep service worker alive
});