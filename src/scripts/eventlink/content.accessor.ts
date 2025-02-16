function randomVersion() {
  return [...Array(8)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")
}

export function getEventId(url: string): number {
  const match = url.match(/\/events\/(\d+)/);
  if (!match) {
    throw new Error("Invalid event URL");
  }
  return parseInt(match[1], 10);
}
export function getOrganizationId(url: string): number {
  const match = url.match(/\/stores\/(\d+)/);
  if (!match) {
    throw new Error("Invalid event URL");
  }
  return parseInt(match[1], 10);
}

export function getXWotcClientHeader(): string {
  const scriptTag = document.querySelector("link[rel='modulepreload'][href*='/assets/appsettings']");
  if (!scriptTag) {
    console.warn("App settings script not found.");
    return;
  }

  const scriptPath = scriptTag.getAttribute("href");
  if (!scriptPath) {
    console.warn("App settings script path missing.");
    return;
  }

  const fullUrl = new URL(scriptPath, window.location.origin).toString();
  console.log("Found app settings script:", fullUrl);
  let sgwVersion = randomVersion();

  const userAgent = navigator.userAgent;
  const browserInfo = (() => {
    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome")) return { name: "chrome", version: (ua.match(/chrome\/([\d.]+)/) || [])[1] };
    if (ua.includes("firefox")) return { name: "firefox", version: (ua.match(/firefox\/([\d.]+)/) || [])[1] };
    if (ua.includes("safari") && !ua.includes("chrome")) return { name: "Safari", version: (ua.match(/version\/([\d.]+)/) || [])[1] };
    if (ua.includes("edg")) return { name: "edge", version: (ua.match(/edg\/([\d.]+)/) || [])[1] };
    return { name: "Unknown", version: "Unknown" };
  })();

  fetch(fullUrl)
    .then(response => response.text())
    .then(scriptContent => {
      const match = scriptContent.match(/SGW_VERSION\s*:\s*"(?<version>[^"]+)"/);
      if (match) {
        sgwVersion = match.groups.version;
      }
    })
    .catch(error => console.error("Failed to fetch app settings script:", error));
  return `client:eventlink version:${sgwVersion} platform:${navigator.platform}/${browserInfo.name}/${browserInfo.version};`
}
