import { getLogger } from "~resources/logging/logger"
import EventService from "~resources/domain/services/event.service"
import SettingsService from "~resources/domain/services/settings.service"

export const logger = getLogger("background-service")
export const eventService = new EventService()
export const settingsService = new SettingsService()