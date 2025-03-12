import { logger, settingsService } from "./singletons"

(async () => {
  logger.debug("Background script started")

  await settingsService.get()
    .then(settings => settings?.showWelcome)
    .then(showWelcome => {
      if (showWelcome) {
        chrome.tabs.create({ url: chrome.runtime.getURL('tabs/main.html#/welcome') });
      }
    })
})()