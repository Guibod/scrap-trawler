import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { ContentScriptLogger } from "./logger.content";
import { MessageTypes } from "~resources/messages/message-types"

// Shared mock function
const mockSendMessage = vi.fn();

// Properly mock `chrome.runtime`
vi.stubGlobal("chrome", {
  runtime: {
    id: "mock-extension-id",
    sendMessage: mockSendMessage,
  },
});

describe("ContentScriptLogger", () => {
  let logger: ContentScriptLogger;

  beforeEach(() => {
    vi.clearAllMocks(); // Ensure no stale mock data
    logger = new ContentScriptLogger("TestContext");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should send debug logs to the background script", () => {
    logger.debug("Debug message", { key: "value" });
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: MessageTypes.LOG,
      level: "debug",
      context: "TestContext",
      message: "Debug message",
      data: { key: "value" },
    });
  });

  it("should send info logs to the background script", () => {
    logger.info("Info message");
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: MessageTypes.LOG,
      level: "info",
      context: "TestContext",
      message: "Info message",
      data: undefined,
    });
  });

  it("should send warn logs to the background script", () => {
    logger.warn("Warning message");
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: MessageTypes.LOG,
      level: "warn",
      context: "TestContext",
      message: "Warning message",
      data: undefined,
    });
  });

  it("should send error logs to the background script", () => {
    logger.error("Error message");
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: MessageTypes.LOG,
      level: "error",
      context: "TestContext",
      message: "Error message",
      data: undefined,
    });
  });

  it("should send exception logs to the background script", () => {
    const error = new Error("Something went wrong");
    logger.exception(error);
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: MessageTypes.LOG,
      level: "error",
      context: "TestContext",
      message: "Something went wrong",
      data: {
        stack: error.stack
      },
    });
  });
});
