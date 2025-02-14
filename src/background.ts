console.log("Scrap Trawler background script is running.");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Received message in background:", message);

  if (message.action === "START_SCRAPE") {
    console.log("Forwarding START_SCRAPE to content script...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "START_SCRAPE" });
      }
    });
    sendResponse({ status: "Scrape initiated" });
  }

  if (message.action === "SCRAPE_COMPLETE") {
    console.log("Forwarding SCRAPE_COMPLETE to UI...");
    chrome.runtime.sendMessage({ action: "SCRAPE_COMPLETE", data: message.data });
  }

  return true; // Keep service worker alive
});