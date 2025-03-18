import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { sendToBackground } from "@plasmohq/messaging";
import { ContentScriptLogger } from "~/resources/logging/logger.content"

// Mock Plasmo messaging module
vi.mock("@plasmohq/messaging", () => ({
  sendToBackground: vi.fn(),
}));

vi.mock("consola", () => ({
  createConsola: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    start: vi.fn(),
  }),
}));

describe("ContentScriptLogger", () => {
  let logger: ContentScriptLogger;

  // Utility function to allow log queue processing
  async function flushLoggerQueue() {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Ensure enough time for queue processing
  }

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new ContentScriptLogger("TestContext");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should enqueue and send debug logs to the background script", async () => {
    logger.debug("Debug message", { key: "value" });

    await flushLoggerQueue(); // Wait for queue to process

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "logging/page-to-backend",
      body: expect.arrayContaining([
        {
          level: "debug",
          message: "Debug message",
          context: "TestContext",
          data: { key: "value" },
        },
      ]),
    });
  });

  it("should enqueue and send info logs to the background script", async () => {
    logger.info("Info message", { key: "info-data" });

    await flushLoggerQueue();

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "logging/page-to-backend",
      body: expect.arrayContaining([
        {
          level: "info",
          message: "Info message",
          context: "TestContext",
          data: { key: "info-data" },
        },
      ]),
    });
  });

  it("should enqueue and send error logs to the background script", async () => {
    logger.error("Error message", { key: "error-data" });

    await flushLoggerQueue();

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "logging/page-to-backend",
      body: expect.arrayContaining([
        {
          level: "error",
          message: "Error message",
          context: "TestContext",
          data: { key: "error-data" },
        },
      ]),
    });
  });

  it("should correctly log and send exception stack traces", async () => {
    const error = new Error("Something went wrong");

    logger.exception(error);

    await flushLoggerQueue();

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "logging/page-to-backend",
      body: expect.arrayContaining([
        {
          level: "error",
          message: "Something went wrong",
          context: "TestContext",
          data: expect.objectContaining({ stack: expect.any(String) }),
        },
      ]),
    });
  });

  it("should prevent queue overflow by dropping old logs", async () => {
    for (let i = 0; i < 1100; i++) {
      logger.debug(`Message ${i}`);
    }

    await flushLoggerQueue();

    // Ensure only 1000 logs are in the final queue
    expect(sendToBackground).toHaveBeenCalledWith({
      name: "logging/page-to-backend",
      body: expect.arrayContaining([
        expect.objectContaining({ message: "Message 100" }), // The first 100 should be dropped
      ]),
    });
  });
});
