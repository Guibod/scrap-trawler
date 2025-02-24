export default class Context {
  static getEventId (url: string): string {
    const match = url.match(/\/events\/(\d+)/);
    if (!match) throw new Error("Invalid event URL");
    return match[1];
  }

  static getOrganizationId (url: string): string {
    const match = url.match(/\/stores\/(\d+)/);
    if (!match) throw new Error("Invalid event URL");
    return match[1];
  }

  static getAppSettingsUrl(doc: Document): string | null {
    const scriptTag = doc.querySelector("link[rel='modulepreload'][href*='/assets/appsettings']");
    if (!scriptTag) {
      return null
    }

    const scriptPath = scriptTag.getAttribute("href");
    if (!scriptPath) {
      return null;
    }

    return new URL(scriptPath, window.location.origin).toString()
  }
}