import SettingsService from "~/resources/domain/services/settings.service"
import DatabaseService from "~/resources/storage/database"
import { logger } from "./singletons"

(async () => {
  logger.debug("Background script started")

  const db = DatabaseService.getInstance()
  await db.open()

  await SettingsService.getInstance().get()
    .then(settings => settings?.showWelcome)
    .then(showWelcome => {
      if (showWelcome) {
        chrome.tabs.create({ url: chrome.runtime.getURL('tabs/main.html#/welcome') });
      }
    })
})()