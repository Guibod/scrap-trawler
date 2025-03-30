import { describe, it, expect, vi, beforeEach } from "vitest"
import { ScrapeTrigger } from "~/resources/integrations/eventlink/types"
import { getAuthToken } from "~/resources/integrations/eventlink/utils"
import handler from "~/background/messages/eventlink/scrape"

vi.mock("~/resources/domain/mappers/event.mapper.ts", () => ({
  default: {
    toDbo: vi.fn().mockImplementation((entity) => entity)
  }
}))

vi.mock("~/resources/integrations/eventlink/utils", () => ({
  getAuthToken: vi.fn().mockResolvedValue("mock-token"),
  getClientHeader: vi.fn().mockResolvedValue("mock-header"),
  isJwtExpired: vi.fn().mockReturnValue(false)
}))

vi.mock("~/resources/integrations/eventlink/graphql/client", () => ({
  EventLinkGraphQLClient: vi.fn().mockImplementation((token, header) => ({
    token,
    header
  }))
}))

const mockScrape = vi.fn()
vi.mock("~/resources/integrations/eventlink/event.scrape.runner", () => ({
  EventScrapeRunner: vi.fn().mockImplementation(() => ({
    scrape: mockScrape
  }))
}))

describe("eventlink/scrape message handler", () => {
  const req = {
    body: {
      eventId: "abc123",
      organizationId: "org456",
      trigger: ScrapeTrigger.MANUAL
    }
  }

  const res = {
    send: vi.fn(),
    error: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("runs a valid scrape and responds with the entity", async () => {
    const entity = { id: "abc123", result: "hydrated" }
    mockScrape.mockResolvedValue(entity)

    await handler(req as any, res as any)
    expect(res.send).toHaveBeenCalledWith(entity)
  })

  it("throws ScrapingError if required fields are missing", async () => {
    await handler({ body: {} } as any, res as any)

    expect(res.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        "message": "Scraping Error: Invalid request body",
      })
    })
  })

  it("throws ScrapingError if auth or client header fails", async () => {
    vi.mocked(getAuthToken).mockRejectedValueOnce(new Error("fail"))

    await handler(req as any, res as any)

    expect(res.send).toHaveBeenCalledWith({
      error: expect.objectContaining({
        "message": "Scraping Error: Failed to get auth token or client header",
      })
    })
  })

  it("passes correct trigger to runner", async () => {
    const entity = { id: "abc123" }
    mockScrape.mockResolvedValue(entity)

    await handler(req as any, res as any)
    expect(mockScrape).toHaveBeenCalledWith("abc123", "org456", ScrapeTrigger.MANUAL)
  })
})
