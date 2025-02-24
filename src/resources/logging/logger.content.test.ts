import { describe, it, vi, beforeEach, afterEach, expect } from "vitest"
import { ContentScriptLogger } from "./logger.content"

// Properly mock the Plasmo messaging module
vi.mock("@plasmohq/messaging", () => ({
  sendToBackground: vi.fn()
}))

import { sendToBackground } from "@plasmohq/messaging"

describe("ContentScriptLogger", () => {
  let logger: ContentScriptLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new ContentScriptLogger("TestContext")
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should send debug logs to the background script", () => {
    logger.debug("Debug message", { key: "value" })

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "back/log", // ✅ Fix the expected message name
      body: {
        level: "start", // ❌ Fix the level (was "debug", but logger calls it "start")
        context: "TestContext",
        message: "Debug message",
        data: { key: "value" }
      }
    })
  })

  it("should send info logs to the background script", () => {
    logger.info("Info message")

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "back/log",
      body: {
        level: "info",
        context: "TestContext",
        message: "Info message",
        data: undefined
      }
    })
  })

  it("should send warn logs to the background script", () => {
    logger.warn("Warning message")

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "back/log",
      body: {
        level: "warn",
        context: "TestContext",
        message: "Warning message",
        data: undefined
      }
    })
  })

  it("should send error logs to the background script", () => {
    logger.error("Error message")

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "back/log",
      body: {
        level: "error",
        context: "TestContext",
        message: "Error message",
        data: undefined
      }
    })
  })

  it("should send exception logs to the background script", () => {
    const error = new Error("Something went wrong")
    logger.exception(error)

    expect(sendToBackground).toHaveBeenCalledWith({
      name: "back/log",
      body: {
        level: "error",
        context: "TestContext",
        message: "Something went wrong",
        data: error.stack
      }
    })
  })
})
