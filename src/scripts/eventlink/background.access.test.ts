import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BackgroundAccessor } from "~/scripts/eventlink/background.accessor";

describe("BackgroundAccessor", () => {
  let mockCookieGetter: vi.Mock;

  beforeEach(() => {
    mockCookieGetter = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAuthCookie", () => {
    it("should return the auth cookie value when it exists", async () => {
      mockCookieGetter.mockImplementation((_details, callback) => callback({ value: "test_cookie_value" }));

      const accessor = new BackgroundAccessor(mockCookieGetter);
      const result = await accessor.getAuthCookie();

      expect(result).toBe("test_cookie_value");
      expect(mockCookieGetter).toHaveBeenCalledWith(
        { url: "https://eventlink.wizards.com", name: "clientAuth" },
        expect.any(Function)
      );
    });

    it("should return null if the auth cookie does not exist", async () => {
      mockCookieGetter.mockImplementation((_details, callback) => callback(null));

      const accessor = new BackgroundAccessor(mockCookieGetter);
      const result = await accessor.getAuthCookie();

      expect(result).toBeNull();
    });
  });

  describe("getAccessToken", () => {
    it("should return access token when cookie contains a valid JWT", async () => {
      const mockToken = JSON.stringify({ access_token: "valid_access_token" });
      const encodedToken = btoa(mockToken);

      mockCookieGetter.mockImplementation((_details, callback) => callback({ value: encodedToken }));

      const accessor = new BackgroundAccessor(mockCookieGetter);
      const result = await accessor.getAccessToken();

      expect(result).toBe("valid_access_token");
    });

    it("should return null if the cookie is missing", async () => {
      mockCookieGetter.mockImplementation((_details, callback) => callback(null));

      const accessor = new BackgroundAccessor(mockCookieGetter);
      const result = await accessor.getAccessToken();

      expect(result).toBeNull();
    });

    it("should return null if the cookie is not a valid JSON", async () => {
      const invalidToken = "not_a_valid_base64";

      mockCookieGetter.mockImplementation((_details, callback) => callback({ value: invalidToken }));

      const accessor = new BackgroundAccessor(mockCookieGetter);
      const result = await accessor.getAccessToken();

      expect(result).toBeNull();
    });

    it("should return null if JSON does not contain access_token", async () => {
      const mockInvalidPayload = JSON.stringify({ wrong_key: "no_access_token" });
      const encodedInvalidToken = btoa(mockInvalidPayload);

      mockCookieGetter.mockImplementation({ value: encodedInvalidToken });

      const accessor = new BackgroundAccessor(mockCookieGetter);
      const result = await accessor.getAccessToken();

      expect(result).toBeNull();
    });

    it("should handle unexpected errors gracefully", async () => {
      mockCookieGetter.mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const accessor = new BackgroundAccessor(mockCookieGetter);
      const result = await accessor.getAccessToken();

      expect(result).toBeNull();
    });
  });
});
