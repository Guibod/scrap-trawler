import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getLogger } from "~/resources/logging/logger"

const logger = getLogger("background")

export type FetchRequest = {
  url: string | URL | globalThis.Request
  init?: RequestInit
}

export type FetchResponse = {
  ok: boolean
  data?: any
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<FetchRequest, FetchResponse> = async (req, res) => {
  try {
    logger.info(`Fetching ${req.body.url}`)
    const response = await fetch(req.body.url, req.body.init)
    logger.debug(`Fetched ${req.body.url}`, response)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${req.body.url}`)
    }

    const contentType = response.headers.get("content-type") || ""

    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text()

    res.send({ ok: true, data: payload })
  } catch (e) {
    logger.error(`Failed to fetch ${req.body.url}`)
    logger.exception(e)
    res.send({ ok: false, error: (e as Error).message })
  }
}


export default handler