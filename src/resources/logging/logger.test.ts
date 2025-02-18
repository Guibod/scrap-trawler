import { describe, it, vi, beforeEach, expect } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { LoggerInterface } from "./interface";
import { LoggerProxy } from "./logger";

const mockLogger = mockDeep<LoggerInterface>();
vi.mock("../../src/logging/logger.background", () => ({
  BackgroundLogger: vi.fn(() => mockLogger),
}));
vi.mock("../../src/logging/logger.content", () => ({
  ContentScriptLogger: vi.fn(() => mockLogger),
}));

describe("LoggerProxy - Background Script", () => {
  beforeEach(async () => {
    const sendMessage = vi.fn();

    vi.stubGlobal("chrome", { tabs: {}, runtime: { id: 10, sendMessage } });
    vi.clearAllMocks();
  });

  it("should detect context as background", () => {
    expect(LoggerProxy.isBackgroundServiceWorker()).toBe(true);
  })

  it("should use BackgroundLogger in background scripts", () => {
    const logger = new LoggerProxy("TestClass");
    expect(logger).toBeInstanceOf(LoggerProxy);
    expect(logger.loggerImplementation).toEqual("BackgroundLogger");
  });
});

describe("LoggerProxy - Content Script", () => {
  const sendMessage = vi.fn();

  beforeEach(() => {
    // Simulate running in a content script
    vi.stubGlobal("chrome", { runtime: { sendMessage }});
    vi.clearAllMocks();
  });

  it("should detect context as foreground", () => {
    expect(LoggerProxy.isBackgroundServiceWorker()).toBe(false);
  })

  it("should use ContentScriptLogger in content scripts", () => {
    const logger = new LoggerProxy("TestClass");
    expect(logger).toBeInstanceOf(LoggerProxy);
    expect(logger.loggerImplementation).toEqual("ContentScriptLogger");
  });
});