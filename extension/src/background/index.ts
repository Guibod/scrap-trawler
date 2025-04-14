import SettingsService from "~/resources/domain/services/settings.service"
import DatabaseService from "~/resources/storage/database"
import { getLogger } from "~/resources/logging/logger"

let activePorts = 0;
(async () => {
  const logger = getLogger("background")
  logger.start("Background script")

  const db = DatabaseService.getInstance()
  await db.open()

  await Promise.all([
    db.cards.count().then(count => {
      logger.debug(`Database has ${count} cards`)
    }),
    db.events.count().then(count => {
      logger.debug(`Database has ${count} events`)
    })
  ])

  await SettingsService.getInstance().get()
    .then(settings => settings?.showWelcome)
    .then(showWelcome => {
      if (showWelcome) {
        chrome.tabs.create({ url: chrome.runtime.getURL('tabs/main.html#/welcome') });
      }
    })
})()