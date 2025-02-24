import { getLogger } from "~resources/logging/logger"
import EventService from "~resources/domain/services/event.service"

export const logger = getLogger("background-service")
export const eventService = new EventService()