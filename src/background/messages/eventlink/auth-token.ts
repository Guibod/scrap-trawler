import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getLogger } from "~/resources/logging/logger"

const logger = getLogger("get_auth_token")

type GetCookieRequest = {
  name?: string;
}

const handler: PlasmoMessaging.MessageHandler<GetCookieRequest, string | null> = async (req, res) => {
  logger.debug("Received get_auth_token message", req)
  chrome.cookies.get(
    { url: "https://eventlink.wizards.com", name: req.body?.name || "clientAuth" },
    (cookie: chrome.cookies.Cookie) => {
      if (!cookie) {
        res.send(null)
        return;
      }

      const authCookieJson = atob(cookie.value);
      const payload: { access_token: string } = JSON.parse(authCookieJson);
      res.send(payload.access_token);
      logger.debug("Responded get_auth_token message")
    }
  );
}

export default handler