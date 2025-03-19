import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getLogger } from "~/resources/logging/logger"

const logger = getLogger("background")

export type LogMessage = {
  level: "debug" | "info" | "warn" | "error" | "start",
  message: string,
  context: string,
  data?: object
}

const handler: PlasmoMessaging.MessageHandler<LogMessage[], void> = async (req) => {
  for (const log of req.body) {
    logger[log.level](`${log.context}: ${log.message}`, log.data)
  }
}

export default handler