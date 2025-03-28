import { beforeEach, describe, expect, it, vi } from "vitest"
import EventService from "~/resources/domain/services/event.service"
import { EventDao } from "~/resources/storage/event.dao"
import EventEntity, { type DeckEntity, EVENT_ENTITY_VERSION } from "~/resources/storage/entities/event.entity"
import type { EventWriteDbo } from "~/resources/domain/dbos/event.write.dbo"
import EventMapper from "~/resources/domain/mappers/event.mapper"
import { createMock, type DeepMocked } from "@golevelup/ts-vitest"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { EventSummarizedDbo } from "~/resources/domain/dbos/event.summarized.dbo"
import EventHydrator from "~/resources/domain/mappers/event.hydrator"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"

vi.mock("~/resources/storage/event.dao"); // Mock EventDao
const mockDao: DeepMocked<EventDao> = createMock<EventDao>();


describe("EventService", () => {
  let service: EventService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = EventService.getInstance(mockDao);
  });

  it("should be a singleton", () => {
    const instance1 = EventService.getInstance();
    const instance2 = EventService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should save an event (and use mapper)", async () => {
    const eventDbo: EventWriteDbo = {
      id: "1",
      raw_data: {}
    } as EventWriteDbo;

    mockDao.save.mockResolvedValue({ saved: true } as unknown as EventEntity);
    vi.spyOn(EventMapper, "toDbo").mockResolvedValue({ dbo: true } as unknown as EventModel);
    vi.spyOn(EventMapper, "toEntity").mockReturnValue({ entity: true } as unknown as EventEntity);

    const result = await service.save(eventDbo);

    expect(EventMapper.toEntity).toHaveBeenCalledWith(eventDbo);
    expect(mockDao.save).toHaveBeenCalledWith({ entity: true });
    expect(EventMapper.toDbo).toHaveBeenCalledWith({ saved: true });
    expect(result).toEqual({ dbo: true });
  });

  it("should retrieve an event", async () => {
    const eventEntity = new EventEntity();
    eventEntity.id = "1";
    eventEntity.version = EVENT_ENTITY_VERSION;

    mockDao.get.mockResolvedValue(eventEntity);
    vi.spyOn(EventMapper, "toDbo").mockResolvedValue({ dbo: true } as unknown as EventModel);

    const result = await service.get("1");

    expect(mockDao.get).toHaveBeenCalledWith("1");
    expect(EventMapper.toDbo).toHaveBeenCalledWith(eventEntity)
    expect(result).toEqual({ dbo: true });
  });

  it("should return null when event retrieval fails", async () => {
    mockDao.get.mockRejectedValue(new Error("Not found"));

    const result = await service.get("1");

    expect(mockDao.get).toHaveBeenCalledWith("1");
    expect(result).toBeNull();
  });

  it("should delete an event", async () => {
    mockDao.delete.mockResolvedValue();

    await service.delete(["1"]);

    expect(mockDao.delete).toHaveBeenCalledWith(["1"]);
  });

  it("should list all events", async () => {
    const eventEntities = [
      { id: "1", title: "Event 1", version: EVENT_ENTITY_VERSION } as unknown as EventEntity,
      { id: "2", title: "Event 2", version: EVENT_ENTITY_VERSION } as unknown as EventEntity,
    ];
    mockDao.getAll.mockResolvedValue(eventEntities);
    vi.spyOn(EventMapper, "toLightDbo").mockResolvedValue(({ dbo: true} as unknown as EventSummarizedDbo));

    const result = await service.listEvents();

    expect(mockDao.getAll).toHaveBeenCalled();
    expect(result).toEqual(eventEntities.map(EventMapper.toLightDbo));
  });

  it("should hydrate outdated events", async () => {
    const outdatedEvent = { id: "1", version: 0 } as EventEntity;

    mockDao.save.mockResolvedValue({ saved: true } as unknown as EventEntity);
    vi.spyOn(EventHydrator, "hydrate").mockReturnValue({ hydrated: true } as unknown as EventEntity);

    const result = await service.hydrateOldVersion(outdatedEvent);

    expect(mockDao.save).toHaveBeenCalledWith({ hydrated: true });
    expect(result).toEqual({ saved: true });
  });

  it("should not hydrate up-to-date events", async () => {
    const upToDateEvent = { id: "1", version: EVENT_ENTITY_VERSION } as EventEntity;

    const result = await service.hydrateOldVersion(upToDateEvent);

    expect(mockDao.save).not.toHaveBeenCalled();
    expect(result).toEqual(upToDateEvent);
  });

  describe("EventService.addDeckToEvent", () => {
    let service: EventService

    beforeEach(() => {
      vi.clearAllMocks()
      service = EventService.getInstance(mockDao)
    })

    it("should update the deck and raw data, then save and return mapped result", async () => {
      const deck: DeckEntity = {
        archetype: "",
        name: "",
        status: DeckStatus.PENDING,
        boards: {
          mainboard: [
            { name: "Forest", quantity: 24 }
          ]
        },
        id: "deck-1",
        url: "https://example.com",
        spreadsheetRowId: "row-1",
        lastUpdated: new Date().toISOString(),
        face: undefined,
        legal: true,
        format: MTG_FORMATS.COMMANDER,
        colors: [MTG_COLORS.GREEN]
      }

      const rawData = { raw: true }

      const entity = new EventEntity()
      entity.id = "event-1"
      entity.decks = [{ id: "deck-1" }, { id: "deck-2" }] as DeckEntity[]

      mockDao.get.mockResolvedValue(entity)
      mockDao.save.mockResolvedValue(entity)
      vi.spyOn(EventMapper, "toDbo").mockResolvedValue({ id: "event-1" } as EventModel)

      const result = await service.addDeckToEvent("event-1", deck, rawData)

      expect(mockDao.get).toHaveBeenCalledWith("event-1")
      expect(entity.raw_data.fetch["deck-1"]).toEqual(rawData)
      expect(entity.decks).toContain(deck)
      expect(entity.decks.find(d => d.id === "deck-1")).toEqual(deck)
      expect(entity.decks.find(d => d.id === "deck-2")).toBeDefined()
      expect(mockDao.save).toHaveBeenCalledWith(entity)
      expect(EventMapper.toDbo).toHaveBeenCalledWith(entity)
      expect(result).toEqual({ id: "event-1" })
    })

    it("should return null and log a warning if event is not found", async () => {
      mockDao.get.mockResolvedValue(null)

      const deck = { id: "deck-1" } as DeckEntity
      const result = await service.addDeckToEvent("missing-event", deck, {})

      expect(result).toBeNull()
      expect(mockDao.save).not.toHaveBeenCalled()
    })
  })
});
