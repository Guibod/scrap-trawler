import { type PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging"
import Bowser from "bowser"
import { getLogger } from "~resources/logging/logger"

const logger = getLogger("get-client-header")

const defaultRandomVersion = () => [...Array(8)]
  .map(() => Math.floor(Math.random() * 16).toString(16))
  .join("")

export type RequestBody = undefined

export type ResponseBody = string | null;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  logger.debug("Received get-client-header message", req)
  let sgwVersion = defaultRandomVersion()
  const fullUrl = await sendToContentScript({ name: "contents/app-settings", body: null}).catch(e => {
    logger.error("Failed to get app settings URL", e)
    return null
  })
  if (fullUrl) {
    try {
      const scriptContent = await fetch(fullUrl).then(response => response.text());
      const match = scriptContent.match(/SGW_VERSION\s*:\s*"(?<version>[^"]+)"/);
      if (match && match.groups) {
        sgwVersion = match.groups.version;
      }
    } catch (error) {
      // silence this, we’ll use the random version
    }
  }

  const parsed = Bowser.parse(navigator.userAgent);
  const platform = parsed.os.name || "unknown";
  const browser = (parsed.browser.name || "unknown").toLowerCase();
  const version = parsed.browser.version || "unknown";
  const header = `client:eventlink version:${sgwVersion} platform:${platform}/${browser}/${version}`
  res.send(header)
  logger.debug("Responded get-client-header message", { header })
}

export default handler