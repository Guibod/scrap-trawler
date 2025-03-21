import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { EventDao } from "~/resources/storage/event.dao";
import EventBuilder from "~/resources/domain/builders/event.builder"
import EventMapper from "~/resources/domain/mappers/event.mapper"
import { sampleEvent, sampleGameState, sampleOrganizer } from "~/resources/integrations/eventlink/data/sample.event"
import EventEntity, { EVENT_ENTITY_VERSION } from "~/resources/storage/entities/event.entity"

let eventDao: EventDao

const generateEntity = (id = undefined): EventEntity => {
  return {
    ...EventMapper.toEntity(EventBuilder.anEvent.withTitle(id).withId(id).build()),
    version: EVENT_ENTITY_VERSION,
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
    }
  };
}

beforeEach(() => {
  eventDao = EventDao.getInstance();
  eventDao.clear()
});

describe("EventDao", () => {
  it('should create a singleton instance', () => {
    const dao1 = EventDao.getInstance();
    const dao2 = EventDao.getInstance();

    expect(dao1).toBe(dao2); // Singleton check
  });

  it("should save and retrieve an event", async () => {
    const event = generateEntity();
    await eventDao.save(event);
    const retrievedEvent = await eventDao.get(event.id);
    expect(retrievedEvent).toEqual({
      ...event,
      lastUpdated: expect.any(String)
    });
  });

  it("should stream out only listed events", async () => {
    const events = [
      generateEntity("event-1"),
      generateEntity("event-2"),
    ];

    for (const event of events) {
      await eventDao.save(event);
    }

    const streamedEvents = [];
    for await (const event of eventDao.streamOut(["event-1", "event-3"])) {
      streamedEvents.push(event);
    }

    expect(streamedEvents).toHaveLength(1);
    expect(streamedEvents[0]).toEqual({
      ...events[0],
      lastUpdated: expect.any(String)
    });
  });

  it("should stream out events", async () => {
    const events = [
      generateEntity("event-1"),
      generateEntity("event-2"),
    ]

    for (const event of events) {
      await eventDao.save(event);
    }

    const streamedEvents = [];
    for await (const event of eventDao.streamOut(null)) {
      streamedEvents.push(event);
    }

    expect(streamedEvents[0]).toEqual({
      ...events[0],
      lastUpdated: expect.any(String)
    });
    expect(streamedEvents[1]).toEqual({
      ...events[1],
      lastUpdated: expect.any(String)
    });
  });

  it("should stream in events", async () => {
    const events = [
      generateEntity("event-1"),
      generateEntity("event-2"),
    ]

    async function* eventGenerator() {
      for (const event of events) {
        yield event;
      }
    }

    await eventDao.streamIn(eventGenerator());

    expect(await eventDao.get("event-1")).toEqual(events[0]);
    expect(await eventDao.get("event-2")).toEqual(events[1]);
    expect(await eventDao.count()).toEqual(2);
    expect(await eventDao.countWith("id", ["event-1", "event-3"])).toEqual(1);

  });

  it("should return an empty stream when no events exist", async () => {
    const streamedEvents = [];
    for await (const event of eventDao.streamOut(null)) {
      streamedEvents.push(event);
    }
    expect(streamedEvents).toEqual([]);
  });
});
