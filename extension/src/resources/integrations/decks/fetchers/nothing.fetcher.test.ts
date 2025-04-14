import { describe, expect, it } from "vitest"
import { UnresolvedFetcherError } from "~/resources/integrations/decks/exceptions"
import { NothingFetcher } from "~/resources/integrations/decks/fetchers/nothing.fetcher"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

const mockSettingsService = {} as any
const mockCardService = {} as any
const mockEventService = {} as any

describe("NothingFetcher", () => {
  const fetcher = new NothingFetcher(mockSettingsService, mockCardService, mockEventService)

  const row = {
    decklistUrl: "https://example.com/nothing"
  } as SpreadsheetRow

  const request = new DeckFetchRequest('e1', MTG_FORMATS.DUEL, row)

  it("should return a failed DeckFetchResponse", async () => {
    const result = await fetcher.run(request)

    expect(result.success).toBe(false)
    expect(result.deck).toBeNull()
    expect(result.errorMessage).toBe("No fetcher for this row")
    expect(result.rawData).toBe("https://example.com/nothing")
    expect(result.request).toBe(request)
  })

  it("should throw UnresolvedFetcherError on parse()", async () => {
    await expect(fetcher.parse()).rejects.toThrow(UnresolvedFetcherError)
  })

  it("should generate deterministic id", async () => {
    const id = await NothingFetcher.generateId(row)
    expect(id).toBe("nothing:https://example.com/nothing")
  })

  it("should noop on applyThrottle", async () => {
    const result = await fetcher.applyThrottle()
    expect(result).toBe(fetcher)
  })
})
