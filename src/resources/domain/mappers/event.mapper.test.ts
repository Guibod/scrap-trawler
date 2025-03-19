import { describe, expect, it } from "vitest"
import EventMapper from "~/resources/domain/mappers/event.mapper"
import EventEntity, { EVENT_ENTITY_VERSION, isEventEntity } from "~/resources/storage/entities/event.entity"
import type { EventWriteDbo } from "~/resources/domain/dbos/event.write.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { EventSummarizedDbo } from "~/resources/domain/dbos/event.summarized.dbo"
import { sampleEvent, sampleGameState, sampleOrganizer } from "~/resources/integrations/eventlink/data/sample.event"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"

// Mock event entity
const mockEventEntity = new EventEntity();
Object.assign(mockEventEntity, {
  id: "event-123",
  title: "Test Event",
  date: new Date("2023-03-01"),
  organizer: { id: "org-1", name: "Test Org" },
  players: [],
  teams: [],
  rounds: [],
  raw_data: {},
  scrapeStatus: {},
  lastUpdated: new Date("2023-03-02"),
});

describe("EventMapper", () => {
  it("should map EventEntity to EventModel", async () => {
    const result: EventModel = await EventMapper.toDbo(mockEventEntity);
    expect(result).toMatchObject({
      id: "event-123",
      title: "Test Event",
      date: new Date("2023-03-01"),
      organizer: { id: "org-1", name: "Test Org" },
      scrapeStatus: {},
      lastUpdated: new Date("2023-03-02"),
    });
  });

  it("should map EventEntity to EventSummarizedDbo", () => {
    const result: EventSummarizedDbo = EventMapper.toLightDbo(mockEventEntity);
    expect(result).toMatchObject({
      id: "event-123",
      title: "Test Event",
      date: new Date("2023-03-01"),
      organizer: "Test Org",
      scrapeStatus: {},
      lastUpdated: new Date("2023-03-02"),
    });
  });

  it("should map EventWriteDbo to EventEntity", () => {
    const mockWriteDbo: EventWriteDbo = {
      id: "event-123",
      title: "Test Event",
      date: new Date("2023-03-01"),
      organizer: { id: "org-1", name: "Test Org", phoneNumber: "123-456-7890", emailAddress: "foo@example.com", location: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] }, properties: { address: "123 Main St" } }, isPremium: true },
      players: {},
      teams: {},
      rounds: {},
      decks: {},
      raw_data: {
        wotc: {
          event: sampleEvent,
          organization: sampleOrganizer,
          rounds: {
            "1": sampleGameState,
            "2": sampleGameState,
          }
        },
        spreadsheet: []
      },
      scrapeStatus: EventScrapeStateDbo.COMPLETE
    };

    const result: EventEntity = EventMapper.toEntity(mockWriteDbo);
    expect(result).toBeInstanceOf(EventEntity);
    expect(result.id).toBe("event-123");
    expect(result.title).toBe("Test Event");
    expect(result.date).toBe("2023-03-01T00:00:00.000Z");
    expect(result.organizer.id).toBe("org-1");
    expect(result.version).toBe(EVENT_ENTITY_VERSION);

    expect(isEventEntity(result)).toBe(true);
  });
});