import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getLogger } from "~/resources/logging/logger"

const logger = getLogger("background")

type LogMessage = {
  level: "debug" | "info" | "warn" | "error",
  message: string,
  context: string,
  data?: object
}

const handler: PlasmoMessaging.MessageHandler<LogMessage, never> = async (req) => {
  logger[req.body.level](`${req.body.context}: ${req.body.message}`, req.body.data)
}

export default handler