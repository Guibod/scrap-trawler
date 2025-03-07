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
  beforeEach(() => {
    const sendMessage = vi.fn();
    vi.stubGlobal("chrome", { tabs: {}, runtime: { id: 10, sendMessage } });
    vi.stubGlobal("process", { env: { CONSOLA_LEVEL: "3" } }); // Ensure consola doesn't break
    vi.clearAllMocks();
  });

  it("should detect context as background", () => {
    expect(LoggerProxy.isBackgroundServiceWorker()).toBe(true);
  });

  it("should use BackgroundLogger in background scripts", () => {
    const logger = new LoggerProxy("TestClass");
    expect(logger).toBeInstanceOf(LoggerProxy);
    expect(logger.loggerImplementation).toEqual("BackgroundLogger");
  });
});

describe("LoggerProxy - Content Script", () => {
  const sendMessage = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("chrome", { runtime: { sendMessage } });
    vi.clearAllMocks();
    vi.stubGlobal("process", { env: {} }); // Keep process.env to prevent consola errors
    vi.stubGlobal("window", { document: {} }); // Ensure window exists to mimic browser environment
  });

  it("should detect context as foreground", () => {
    expect(LoggerProxy.isBackgroundServiceWorker()).toBe(false);
  });

  it("should use ContentScriptLogger in content scripts", () => {
    const logger = new LoggerProxy("TestClass");
    expect(logger).toBeInstanceOf(LoggerProxy);
    expect(logger.loggerImplementation).toEqual("ContentScriptLogger");
  });
});

describe("LoggerProxy - Node.js Runtime", () => {
  beforeEach(() => {
    vi.stubGlobal("process", { versions: { node: "16.0.0" }, env: { CONSOLA_LEVEL: "3" } });
    vi.clearAllMocks();
  });

  it("should detect context as Node.js", () => {
    expect(LoggerProxy.isBackgroundServiceWorker()).toBe(true);
  });

  it("should use BackgroundLogger in Node.js environment", () => {
    const logger = new LoggerProxy("TestClass");
    expect(logger).toBeInstanceOf(LoggerProxy);
    expect(logger.loggerImplementation).toEqual("BackgroundLogger");
  });
});