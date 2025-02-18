import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { BackgroundLogger } from "./logger.background";
import { type ConsolaInstance } from "consola"
import { mock } from "vitest-mock-extended"

const mockLogger = mock<ConsolaInstance>();
vi.mock("consola", () => ({
  createConsola: vi.fn(() => mockLogger), // ✅ Mock `createConsola()`
}));
describe("BackgroundLogger", () => {
  let logger: BackgroundLogger;

  beforeEach(() => {
    logger = new BackgroundLogger("TestContext"); // Now uses the shared mockLogger
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should log debug messages", () => {
    logger.debug("Debug message", { key: "value" });
    expect(mockLogger.debug).toHaveBeenCalledWith("TestContext:", "Debug message", { key: "value" });
  });

  it("should log info messages", () => {
    logger.info("Info message");
    expect(mockLogger.info).toHaveBeenCalledWith("TestContext:", "Info message", undefined);
  });

  it("should log warn messages", () => {
    logger.warn("Warning message");
    expect(mockLogger.warn).toHaveBeenCalledWith("TestContext:", "Warning message", undefined);
  });

  it("should log error messages", () => {
    logger.error("Error message");
    expect(mockLogger.error).toHaveBeenCalledWith("TestContext:", "Error message", undefined);
  });

  it("should log exceptions", () => {
    const error = new Error("Something went wrong");
    logger.exception(error);
    expect(mockLogger.error).toHaveBeenCalledWith(error);
  });

  it("should handle undefined messages gracefully", () => {
    logger.info(undefined);
    expect(mockLogger.info).toHaveBeenCalledWith("TestContext:", undefined, undefined);
  });
});
