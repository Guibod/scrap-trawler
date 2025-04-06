import { describe, it, expect, vi } from "vitest"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import {
  DUMMY_RAW_DATA,
  InstantDummyFetcher,
  SlowDummyFetcher
} from "~/resources/integrations/decks/fetchers/dummy.fetcher"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"

const mockServices = {
  settingsService: {} as any,
  cardService: {} as any,
  eventService: {} as any
}

const row = { id: "123", decklistUrl: "dummy-url" } as SpreadsheetRow
const request = new DeckFetchRequest('event1', MTG_FORMATS.DUEL, row)

describe("InstantDummyFetcher", () => {
  const fetcher = new InstantDummyFetcher(
    mockServices.settingsService,
    mockServices.cardService,
    mockServices.eventService
  )

  it("should generate correct ID", async () => {
    const id = await InstantDummyFetcher.generateId(row)
    expect(id).toBe("dummy-instant:123")
  })

  it("should return a successful DeckFetchResponse", async () => {
    const response = await fetcher.run(request)

    expect(response.success).toBe(true)
    expect(response.rawData).toEqual(DUMMY_RAW_DATA)
    expect(response.request).toBe(request)
    expect(response.deck.name).toBe("TestDeck")
    expect(response.deck.format).toBe(MTG_FORMATS.COMMANDER)
    expect(response.deck.colors).toEqual([MTG_COLORS.GREEN])
  })

  it("applyThrottle should return self immediately", async () => {
    const result = await fetcher.applyThrottle()
    expect(result).toBe(fetcher)
  })
})

describe("SlowDummyFetcher", () => {
  const fetcher = new SlowDummyFetcher(
    mockServices.settingsService,
    mockServices.cardService,
    mockServices.eventService
  )

  it("should generate correct ID", async () => {
    const id = await SlowDummyFetcher.generateId(row)
    expect(id).toBe("dummy-slow:123")
  })

  it("should delay for at least 50ms in applyThrottle", async () => {
    const start = Date.now()
    await fetcher.applyThrottle()
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(45) // allow slight timing variance
  })
})
