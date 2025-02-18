import { describe, test, expect } from "vitest";

import {
  isWorldExtractEventMessage,
  isAppExtractEventMessage,
  isAuthTokenRequest,
  isAppVersionRequest,
  type WorldExtractEventMessage,
  type AppExtractEventMessage,
  type RequestAuthTokenMessage,
  type RequestAppVersionMessage, MessageTypes
} from "~resources/messages/message-types"

describe("Message Type Guards", () => {
  test("isWorldExtractEventMessage should return true for valid message", () => {
    const message: WorldExtractEventMessage = {
      action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST,
      eventId: 123,
      organizationId: 456,
      accessToken: "test-token"
    };

    expect(isWorldExtractEventMessage(message)).toBe(true);
  });

  test("isWorldExtractEventMessage should return false for invalid message", () => {
    const message = { action: MessageTypes.APP_EXTRACT_EVENT_REQUEST };
    expect(isWorldExtractEventMessage(message)).toBe(false);
  });

  test("isAppExtractEventMessage should return true for valid message", () => {
    const message: AppExtractEventMessage = {
      action: MessageTypes.APP_EXTRACT_EVENT_REQUEST,
      url: "https://example.com"
    };

    expect(isAppExtractEventMessage(message)).toBe(true);
  });

  test("isAppExtractEventMessage should return false for invalid message", () => {
    const message = { action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST };
    expect(isAppExtractEventMessage(message)).toBe(false);
  });

  test("isAuthTokenRequest should return true for valid message", () => {
    const message: RequestAuthTokenMessage = {
      action: MessageTypes.AUTH_TOKEN_REQUEST
    };

    expect(isAuthTokenRequest(message)).toBe(true);
  });

  test("isAuthTokenRequest should return false for invalid message", () => {
    const message = { action: MessageTypes.APP_VERSION_REQUEST };
    expect(isAuthTokenRequest(message)).toBe(false);
  });

  test("isAppVersionRequest should return true for valid message", () => {
    const message: RequestAppVersionMessage = {
      action: MessageTypes.APP_VERSION_REQUEST
    };

    expect(isAppVersionRequest(message)).toBe(true);
  });

  test("isAppVersionRequest should return false for invalid message", () => {
    const message = { action: MessageTypes.WORLD_EXTRACT_EVENT_REQUEST };
    expect(isAppVersionRequest(message)).toBe(false);
  });
});
