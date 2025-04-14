import { sendToContentScript } from "@plasmohq/messaging"
import Bowser from "bowser"

function defaultRandomVersion() {
  return [...Array(8)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")
}

export async function getClientHeader() {
  let sgwVersion = defaultRandomVersion()
  const fullUrl = await sendToContentScript({ name: "contents/app-settings", body: null})
    .catch(e => {
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
  return `client:eventlink version:${sgwVersion} platform:${platform}/${browser}/${version}`
}

export async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: "https://eventlink.wizards.com", name: "clientAuth" }, (cookie) => {
      if (!cookie) return resolve(null)
      const payload = JSON.parse(atob(cookie.value))
      resolve(payload.access_token)
    })
  })
}

export function isJwtExpired(token: string): boolean {
  try {
    const [, payloadBase64] = token.split(".")
    const payloadJson = atob(payloadBase64)
    const payload = JSON.parse(payloadJson)

    if (typeof payload.exp !== "number") return true // no exp = assume invalid

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true // malformed = treat as expired
  }
}