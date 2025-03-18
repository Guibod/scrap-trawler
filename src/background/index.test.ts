import { describe, it, expect, vi, beforeEach } from "vitest"
import DatabaseService from "~/resources/storage/database"
import { createMock } from "@golevelup/ts-vitest"
import type SettingsService from "~/resources/domain/services/settings.service"
import type { LoggerInterface } from "~/resources/logging/interface"

// Mock dependencies
const mockSettingsService = createMock<SettingsService>({
  get: vi.fn()
})
vi.mock("~/resources/domain/services/settings.service", () => ({
  default: {
    getInstance: vi.fn(() => mockSettingsService)
  }
}))

const mockDatabaseService = createMock<DatabaseService>({
  open: vi.fn(),
  cards: {
    count: vi.fn(() => Promise.resolve(0))
  },
  events: {
    count: vi.fn(() => Promise.resolve(0))
  }
})

vi.mock("~/resources/storage/database", () => ({
  default: {
    getInstance: vi.fn(() => mockDatabaseService)
  }
}))

const loggerMock = createMock<LoggerInterface>()
vi.doMock("~/resources/logging/logger", () => ({
  getLogger: vi.fn(() => loggerMock)
}))

describe("Background script", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })
  describe("Database Related", () => {
    it("should open the database on startup", async () => {
      mockSettingsService.get.mockResolvedValue({ showWelcome: false })

      await import("~/background/index")

      expect(mockDatabaseService.open).toHaveBeenCalled()
    })

    it("should display the number of cards in database", async () => {
      mockSettingsService.get.mockResolvedValue({ showWelcome: false })

      await import("~/background/index")

      expect(loggerMock.debug).toHaveBeenCalledWith(`Database has 0 cards`)
    })

    it("should display the number of events in database", async () => {
      mockSettingsService.get.mockResolvedValue({ showWelcome: false })

      await import("~/background/index")

      expect(loggerMock.debug).toHaveBeenCalledWith(`Database has 0 events`)
    })
  })

  it("should check the settings on startup", async () => {
    mockSettingsService.get.mockResolvedValue({ showWelcome: false })

    await import("~/background/index")

    expect(mockSettingsService.get).toHaveBeenCalled()
  })

  it("should open the welcome page if showWelcome is true", async () => {
    mockSettingsService.get.mockResolvedValue({ showWelcome: true })
    vi.mocked(chrome.runtime.getURL).mockReturnValue("foo")

    await import("~/background/index")

    expect(chrome.runtime.getURL).toHaveBeenCalledWith("tabs/main.html#/welcome")
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: "foo"
    })
  })

  it("should not open the welcome page if showWelcome is false", async () => {
    mockSettingsService.get.mockResolvedValue({ showWelcome: false })

    await import("~/background/index")

    expect(chrome.tabs.create).not.toHaveBeenCalled()
  })
})
