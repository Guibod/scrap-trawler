import { beforeEach, describe, expect, it, vi } from "vitest"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"
import DeckFetchService from "~/resources/integrations/decks/service"
import { createMock } from "@golevelup/ts-vitest"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import type SettingsService from "~/resources/domain/services/settings.service"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"
import { InstantDummyFetcher, SlowDummyFetcher } from "~/resources/integrations/decks/fetchers/dummy.fetcher"
import DeckFetcherResolver from "~/resources/integrations/decks/resolver"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

vi.mock("~/resources/integrations/decks/resolver", () => ({
  default: {
    resolveFetcherType: vi.fn(() => InstantDummyFetcher)
  }
}))

const mockCardService = createMock<CardService>()

const mockEventService = createMock<EventService>({
  addDeckToEvent: vi.fn(),
  get: vi.fn()
})

const mockSettingsService = createMock<SettingsService>()


const makeRow = (rowId : string = 'row1'): SpreadsheetRow => ({
  id: rowId,
  decklistTxt: '1 Forest',
  player: {},
  archetype: 'hinted archetype',
  decklistUrl: null,
  firstName: 'firstname',
  lastName: 'lastname'
})

describe('DeckFetchService', () => {
  let service: DeckFetchService
  const onStart = vi.fn()
  const onProgress = vi.fn()
  const onComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    service = DeckFetchService.getInstance(mockEventService as any, mockCardService as any, mockSettingsService as any)
    service.setOnEventStart(onStart)
    service.setOnProgress(onProgress)
    service.setOnEventComplete(onComplete)
  })

  it('schedules and executes fetch requests', async () => {
    await service.schedule([new DeckFetchRequest('e1', MTG_FORMATS.DUEL, makeRow())])
    await new Promise(r => setTimeout(r, 10)) // let async queue flush

    expect(mockEventService.addDeckToEvent).toHaveBeenCalled()
    expect(onStart).toHaveBeenCalledWith('e1', 1)
    expect(onProgress).toHaveBeenCalledWith('e1', 1, 1, false, false)
    expect(onComplete).toHaveBeenCalledWith('e1', 'SUCCESS', 1)
  })

  it('ignores duplicate requests', async () => {
    const req = new DeckFetchRequest('e1', MTG_FORMATS.DUEL, makeRow())
    await service.schedule([req, req])
    await new Promise(r => setTimeout(r, 10))

    expect(mockEventService.addDeckToEvent).toHaveBeenCalledTimes(2)
    expect(mockEventService.addDeckToEvent).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({
        "id": "dummy-instant:row1",
        "status": DeckStatus.PENDING,
        "spreadsheetRowId": "row1",
      }),
      null
    )

    expect(mockEventService.addDeckToEvent).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({
        "id": "dummy-instant:row1",
        "status": DeckStatus.FETCHED,
        "spreadsheetRowId": "row1",
      }),
      { dummy: true }
    )
  })

  it('handles cancelRequest properly', async () => {
    const req = new DeckFetchRequest('e1', MTG_FORMATS.DUEL, makeRow('will-cancel'))
    await service.schedule([req])
    await service.cancelRequest(req.id)

    expect(onStart).toHaveBeenCalled()
    expect(onProgress).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('handles cancelAll', async () => {
    await service.schedule([
      new DeckFetchRequest('e1', MTG_FORMATS.DUEL, makeRow()),
      new DeckFetchRequest('e2', MTG_FORMATS.DUEL, makeRow()),
    ])
    await service.cancelAll()

    expect(onStart).toHaveBeenCalled()
    expect(onProgress).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('executes faster fetcher before slower one', async () => {
    const events: string[] = []

    class TimedFetcher extends InstantDummyFetcher {
      async run(request: DeckFetchRequest) {
        events.push(`instant:${Date.now()}`)
        return await super.run(request)
      }
    }

    class DelayedFetcher extends SlowDummyFetcher {
      async run(request: DeckFetchRequest) {
        events.push(`slow:${Date.now()}`)
        return await super.run(request)
      }
    }

    vi.mocked(DeckFetcherResolver.resolveFetcherType).mockImplementation((row: SpreadsheetRow) => {
      if (row.id.startsWith('fast')) return TimedFetcher
      return DelayedFetcher
    })

    await service.schedule([
      new DeckFetchRequest('e1', MTG_FORMATS.DUEL, makeRow('fast-1')),
      new DeckFetchRequest('e2', MTG_FORMATS.DUEL, makeRow('slow-1')),
    ])

    await new Promise(r => setTimeout(r, 100))

    const instant = events.find(e => e.startsWith('instant'))
    const slow = events.find(e => e.startsWith('slow'))

    expect(instant).toBeDefined()
    expect(slow).toBeDefined()
    expect(+instant!.split(':')[1]).toBeLessThan(+slow!.split(':')[1])
  })
})
