import DatabaseService from "~/resources/storage/database"
import { logger, settingsService } from "./singletons"

(async () => {
  logger.debug("Background script started")

  const db = DatabaseService.getInstance()
  await db.open()

  await settingsService.get()
    .then(settings => settings?.showWelcome)
    .then(showWelcome => {
      if (showWelcome) {
        chrome.tabs.create({ url: chrome.runtime.getURL('tabs/main.html#/welcome') });
      }
    })
})()