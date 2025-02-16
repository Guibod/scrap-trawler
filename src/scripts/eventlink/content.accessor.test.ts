import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ContentAccessor } from "~/scripts/eventlink/content.accessor";

describe("ContentAccessor", () => {
  let contentAccessor: ContentAccessor;
  let mockRandomVersion: () => string;

  beforeEach(() => {
    mockRandomVersion = vi.fn().mockReturnValue("abcdef12");
    contentAccessor = new ContentAccessor(mockRandomVersion);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Static Methods", () => {
    it("should correctly extract event ID from a valid URL", () => {
      const url = "https://eventlink.wizards.com/stores/123/events/456";
      expect(ContentAccessor.getEventId(url)).toBe(456);
    });

    it("should throw an error for an invalid event URL", () => {
      const url = "https://eventlink.wizards.com/invalid/456";
      expect(() => ContentAccessor.getEventId(url)).toThrow("Invalid event URL");
    });

    it("should correctly extract organization ID from a valid URL", () => {
      const url = "https://eventlink.wizards.com/stores/123/events/456";
      expect(ContentAccessor.getOrganizationId(url)).toBe(123);
    });

    it("should throw an error for an invalid organization URL", () => {
      const url = "https://eventlink.wizards.com/invalid/456";
      expect(() => ContentAccessor.getOrganizationId(url)).toThrow("Invalid event URL");
    });
  });

  describe("getAppSettingsUrl", () => {
    it("should return null if no matching script tag is found", () => {
      document.body.innerHTML = ""; // No script tag
      expect(contentAccessor.getAppSettingsUrl()).toBeNull();
    });

    it("should return the correct full URL if script tag is found", () => {
      vi.stubGlobal("window", { location: { origin: "https://eventlink.wizards.com" } });

      document.body.innerHTML = `
        <link rel="modulepreload" href="/assets/appsettings-123abc.js">
      `;
      expect(contentAccessor.getAppSettingsUrl()).toBe("https://eventlink.wizards.com/assets/appsettings-123abc.js");
    });
  });

  describe("getXWotcClientHeader", () => {
    beforeEach(() => {
      globalThis.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return a generated client header with random version if no settings file is found", async () => {
      vi.spyOn(contentAccessor, "getAppSettingsUrl").mockReturnValue(null);
      const result = await contentAccessor.getXWotcClientHeader();
      expect(result).toContain("client:eventlink version:abcdef12");
    });

    it("should fetch the SGW_VERSION from app settings and return correct header", async () => {
      vi.spyOn(contentAccessor, "getAppSettingsUrl").mockReturnValue("https://eventlink.wizards.com/assets/appsettings.js");

      const result = await contentAccessor.getXWotcClientHeader();
      expect(result).toContain("client:eventlink version:abcdef12");
    });

    it("should return default random version if fetching fails", async () => {
      vi.spyOn(contentAccessor, "getAppSettingsUrl").mockReturnValue("https://eventlink.wizards.com/assets/appsettings.js");

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await contentAccessor.getXWotcClientHeader();
      expect(result).toContain("client:eventlink version:abcdef12");
    });

    it("should extract browser and OS details for Chrome on macOS", async () => {
      vi.stubGlobal("navigator", {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        platform: "MacIntel",
      });

      const header = await contentAccessor.getXWotcClientHeader();
      expect(header).toBe("client:eventlink version:abcdef12 platform:MacIntel/chrome/112.0.0.0;");
    });

    it("should extract browser and OS details for Firefox on Windows", async () => {
      vi.stubGlobal("navigator", {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
        platform: "Win32",
      });

      const header = await contentAccessor.getXWotcClientHeader();
      expect(header).toBe("client:eventlink version:abcdef12 platform:Win32/firefox/109.0;");
    });

    it("should extract browser and OS details for Safari on macOS", async () => {
      vi.stubGlobal("navigator", {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0.3 Safari/537.36",
        platform: "MacIntel",
      });

      const header = await contentAccessor.getXWotcClientHeader();
      expect(header).toBe("client:eventlink version:abcdef12 platform:MacIntel/Safari/14.0.3;");
    });

    it("should handle unknown browser and OS", async () => {
      vi.stubGlobal("navigator", {
        userAgent: "SomeUnknownUserAgent",
        platform: "UnknownOS",
      });

      const header = await contentAccessor.getXWotcClientHeader();
      expect(header).toBe("client:eventlink version:abcdef12 platform:UnknownOS/Unknown/Unknown;");
    });

    it("should return a different version string if script fetch fails", async () => {
      vi.stubGlobal("navigator", {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
        platform: "Win32",
      });

      // Simulate a failed fetch by returning a rejected promise
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));

      const header = await contentAccessor.getXWotcClientHeader();
      expect(header).toBe("client:eventlink version:abcdef12 platform:Win32/firefox/109.0;");
    });
  });
});
