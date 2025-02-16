export class ContentAccessor {
  private randomVersionGenerator: () => string;

  constructor(randomVersionGenerator?: () => string) {
    this.randomVersionGenerator = randomVersionGenerator || ContentAccessor.defaultRandomVersion;
  }

  private static defaultRandomVersion(): string {
    return [...Array(8)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  static getEventId(url: string): number {
    const match = url.match(/\/events\/(\d+)/);
    if (!match) throw new Error("Invalid event URL");
    return parseInt(match[1], 10);
  }

  static getOrganizationId(url: string): number {
    const match = url.match(/\/stores\/(\d+)/);
    if (!match) throw new Error("Invalid event URL");
    return parseInt(match[1], 10);
  }

  getAppSettingsUrl(): string | null {
    const scriptTag = document.querySelector("link[rel='modulepreload'][href*='/assets/appsettings']");
    if (!scriptTag) {
      return null;
    }

    const scriptPath = scriptTag.getAttribute("href");
    if (!scriptPath) {
      return null;
    }

    return new URL(scriptPath, window.location.origin).toString();
  }

  async getXWotcClientHeader(): Promise<string> {
    let sgwVersion = this.randomVersionGenerator();
    const fullUrl = this.getAppSettingsUrl();

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

    const userAgent = navigator.userAgent;
    const browserInfo = (() => {
      const ua = userAgent.toLowerCase();
      if (ua.includes("chrome")) return { name: "chrome", version: (ua.match(/chrome\/([\d.]+)/) || [])[1] };
      if (ua.includes("firefox")) return { name: "firefox", version: (ua.match(/firefox\/([\d.]+)/) || [])[1] };
      if (ua.includes("safari") && !ua.includes("chrome")) return { name: "Safari", version: (ua.match(/version\/([\d.]+)/) || [])[1] };
      if (ua.includes("edg")) return { name: "edge", version: (ua.match(/edg\/([\d.]+)/) || [])[1] };
      return { name: "Unknown", version: "Unknown" };
    })();

    return `client:eventlink version:${sgwVersion} platform:${navigator.platform}/${browserInfo.name}/${browserInfo.version};`
  }
}
