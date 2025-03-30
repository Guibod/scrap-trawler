import { describe, it, expect, vi, beforeEach } from "vitest"
import { EventScrapeRunner } from "./event.scrape.runner"
import { ScrapeTrigger } from "~/resources/integrations/eventlink/types"
import { TooOldToScrapeError, EventAnonymizationError, ScrapeTooSoonError } from "~/resources/integrations/eventlink/exceptions"
import { NotFoundStorageError } from "~/resources/storage/exceptions"

const mockDao = {
  get: vi.fn(),
  save: vi.fn()
}

const mockClient = {
  getEventDetails: vi.fn(),
  getOrganization: vi.fn(),
  getGameStateAtRound: vi.fn()
}

const sampleEvent = {
  id: "event-1",
  registeredPlayers: [{ firstName: "Jane", lastName: "Doe", displayName: "JaneDoe" }],
  teams: [{ id: "t1" }]
}

const redactedEvent = {
  ...sampleEvent,
  registeredPlayers: [{ firstName: "[REDACTED]", lastName: "[REDACTED]", displayName: "[REDACTED]" }]
}

const sampleOrg = { id: "org-1", name: "Test Org" }

const sampleRound = (n: number) => ({
  roundNumber: n,
  currentRoundNumber: 3,
  rounds: [{}]
})

vi.mock("~/resources/storage/event.dao", () => ({
  EventDao: {
    getInstance: () => mockDao
  }
}))

vi.mock("~/resources/storage/hydrators/event.hydrator", () => ({
  default: {
    hydrate: vi.fn((x) => ({ ...x, __hydrated: true }))
  }
}))

describe("EventScrapeRunner", () => {
  const runner = new EventScrapeRunner(mockClient as any, mockDao as any)

  beforeEach(() => {
    vi.clearAllMocks()
    mockDao.get.mockResolvedValue(null)
    mockDao.save.mockImplementation(async (x) => x)
    mockClient.getEventDetails.mockResolvedValue(sampleEvent)
    mockClient.getOrganization.mockResolvedValue(sampleOrg)
    mockClient.getGameStateAtRound.mockImplementation((_id, round) => Promise.resolve(sampleRound(round)))
  })

  it("scrapes and saves the event successfully", async () => {
    const result = await runner.scrape("event-1", "org-1", ScrapeTrigger.MANUAL)
    expect(result.id).toBe("event-1")
  })

  it("throws ScrapeTooSoonError when scraped too recently", async () => {
    mockDao.get.mockResolvedValue({ lastScrapedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString() })
    await expect(runner.scrape("event-1", "org-1", ScrapeTrigger.AUTOMATED)).rejects.toThrow(ScrapeTooSoonError)
  })

  it("throws EventDataCorruptionError when current data is redacted but previous was not", async () => {
    mockClient.getEventDetails.mockResolvedValue(redactedEvent)
    mockDao.get.mockResolvedValue({
      raw_data: { wotc: { event: sampleEvent } }
    })
    await expect(runner.scrape("event-1", "org-1", ScrapeTrigger.MANUAL)).rejects.toThrow(EventAnonymizationError)
  })

  it("does not throw EventAnonymizationError if redacted and no previous data", async () => {
    mockClient.getEventDetails.mockResolvedValue(redactedEvent)
    mockDao.get.mockRejectedValue(new NotFoundStorageError("foo" as any, "bar"))
    await runner.scrape("event-1", "org-1", ScrapeTrigger.MANUAL)
  })

  it("throws TooOldToScrapeError when purge policy is triggered", async () => {
    mockClient.getGameStateAtRound.mockResolvedValueOnce({ currentRoundNumber: 3 }) // round 1
    mockClient.getGameStateAtRound.mockResolvedValueOnce({}) // round 2
    mockClient.getGameStateAtRound.mockResolvedValueOnce({}) // round 3
    mockClient.getEventDetails.mockResolvedValue({ ...sampleEvent, registeredPlayers: [], teams: [] })

    await expect(runner.scrape("event-1", "org-1", ScrapeTrigger.MANUAL)).rejects.toThrow(TooOldToScrapeError)
  })
})
