import "fake-indexeddb/auto";
import { vi, describe, it, expect, beforeEach, beforeAll } from "vitest";
import { EventDao } from "~/resources/storage/event.dao";
import pako from "pako";
import {
  ExportNotFoundError,
  formats,
  ImportExportService,
  LDJSON_DELIMITER
} from "~/resources/domain/import.export.service"
import EventBuilder from "~/resources/domain/builders/event.builder"
import EventMapper from "~/resources/domain/mappers/event.mapper"
import EventEntity, { EVENT_ENTITY_VERSION } from "~/resources/storage/entities/event.entity"
import { sampleEvent, sampleGameState, sampleOrganizer } from "~/resources/integrations/eventlink/data/sample.event"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"

let dao: EventDao = new EventDao();
let service: ImportExportService
let events: EventEntity[]
const progressMock: ReturnType<typeof vi.fn> = vi.fn()


beforeEach(() => {
  vi.clearAllMocks()
  dao.clear()
});

describe("ImportExportService", () => {
  beforeAll(() => {
    events = Array.from({ length: 10 }, (_, index: number) => {
      return {
        ...EventMapper.toEntity(EventBuilder.anEvent.withId(`event-${index + 1}`).build()),
        version: EVENT_ENTITY_VERSION,
        scrapeStatus: EventScrapeStateDbo.COMPLETE,
        raw_data: {
          wotc: {
            event: sampleEvent,
            organization: sampleOrganizer,
            rounds: {
              1: sampleGameState,
            },
          }
        }
      };
    })
  })

  beforeEach(() => {
    service = new ImportExportService(dao, progressMock);
  })

  describe("IMPORT", () => {
    let stream: ReadableStream

    describe("JSON stream (non-prettified) - 1 event", async () => {
      beforeEach(async () => {
        stream = streamFromData(JSON.stringify(events[0]))
      })

      it("should be detected as LDJSON", async () => {
        expect(await service.detectFormat(stream)).toBe(formats.LDJSON);
      })

      it("should import 1 event", async () => {
        await service.importEvents(stream);

        expect(await dao.count()).toBe(1)
        expect(await dao.get(events[0].id)).toBeDefined()
      })

      it("should show progress", async () => {
        await service.importEvents(stream);

        expect(progressMock).toHaveBeenCalledTimes(1)
        expect(progressMock).toHaveBeenCalledWith(1, null)
      })
    })

    describe("JSON stream (prettified) - 1 event", async () => {
      beforeEach(async () => {
        stream = streamFromData(JSON.stringify(events[0], null, 2))
      })

      it("should be detected as JSON", async () => {
        expect(await service.detectFormat(stream)).toBe(formats.JSON);
      })

      it("should import 1 event", async () => {
        await service.importEvents(stream);

        expect(await dao.count()).toBe(1)
        expect(await dao.get(events[0].id)).toBeDefined()
      })

      it("should show progress", async () => {
        await service.importEvents(stream);

        expect(progressMock).toHaveBeenCalledTimes(1)
        expect(progressMock).toHaveBeenCalledWith(1, null)
      })
    })

    describe("LDJSON stream - 10 events", async () => {
      beforeEach(async () => {
        stream = streamFromData(generateLdJson(events))
      })

      it("should be detected as JSON", async () => {
        expect(await service.detectFormat(stream)).toBe(formats.LDJSON);
      })

      it("should import 10 events", async () => {
        await service.importEvents(stream);

        expect(await dao.count()).toBe(10)
        expect((await dao.get(events[0].id)).id).toBe("event-1")
        expect((await dao.get(events[9].id)).id).toBe("event-10")
      })

      it("should show progress", async () => {
        await service.importEvents(stream);

        expect(progressMock).toHaveBeenCalledTimes(10)
        expect(progressMock).toHaveBeenCalledWith(1, null)
        expect(progressMock).toHaveBeenCalledWith(10, null)
      })
    })

    describe("GZIP stream - 10 events", async () => {
      beforeEach(async () => {
        stream = streamFromData(pako.gzip(generateLdJson(events)))
      })

      it("should be detected as GZIP", async () => {
        expect(await service.detectFormat(stream)).toBe(formats.GZIP);
      })

      it("should import 10 events", async () => {
        await service.importEvents(stream);

        expect(await dao.count()).toBe(10)
        expect((await dao.get(events[0].id)).id).toBe("event-1")
        expect((await dao.get(events[9].id)).id).toBe("event-10")
      })

      it("should show progress", async () => {
        await service.importEvents(stream);

        expect(progressMock).toHaveBeenCalledTimes(10)
        expect(progressMock).toHaveBeenCalledWith(1, null)
        expect(progressMock).toHaveBeenCalledWith(10, null)
      })
    })
  })

  describe("EXPORT", () => {
    let ids = []
    beforeEach(async () => {
      await Promise.all(events.map(async (event) => {
        ids.push(event.id)
        await dao.save(event)
      }))
    })

    describe("JSON", () => {
      it("export ALL is LDJSON", async () => {
        const { stream, getOutput } = createMockWritableStream();

        await service.exportEvents(stream, null, formats.JSON);
        const output = new TextDecoder().decode(await getOutput());

        const expectedJson = events
          .slice()
          .sort((a, b) => a.id.localeCompare(b.id)) // IndexedDB order is lexical
          .map(event => JSON.stringify(event)) // NOT beautified
          .join(LDJSON_DELIMITER);

        expect(removeTimeDependentValues(output))
          .toBe(removeTimeDependentValues(expectedJson));
      });

      it("export ALL use callback", async () => {
        const { stream } = createMockWritableStream();

        await service.exportEvents(stream, null, formats.JSON);

        expect(progressMock).toHaveBeenCalledTimes(10)
        expect(progressMock).toHaveBeenCalledWith(1, 10)
        expect(progressMock).toHaveBeenCalledWith(10, 10)
      });

      it("export ONE is JSON", async () => {
        const { stream, getOutput } = createMockWritableStream();

        await service.exportEvents(stream, ['event-1'], formats.JSON);
        const output = new TextDecoder().decode(await getOutput());

        expect(removeTimeDependentValues(output))
          .toBe(removeTimeDependentValues(JSON.stringify(events[0], null, 2)));
      });

      it("export not found", async () => {
        const { stream } = createMockWritableStream();

        expect(() => service.exportEvents(stream, ['event-not-found'], formats.JSON)).rejects.toThrowError(ExportNotFoundError);
      });
    })

    describe("GZIP", () => {
      it("export ALL is LDJSON", async () => {
        const { stream, getOutput } = createMockWritableStream();

        await service.exportEvents(stream, null, formats.GZIP);
        const output = pako.inflate(await getOutput(), { to: "string" });

        const expectedJson = events
          .slice()
          .sort((a, b) => a.id.localeCompare(b.id)) // IndexedDB order is lexical
          .map(event => JSON.stringify(event)) // NOT beautified
          .join(LDJSON_DELIMITER);

        expect(removeTimeDependentValues(output))
          .toBe(removeTimeDependentValues(expectedJson));
      });

      it("export ALL use callback", async () => {
        const { stream } = createMockWritableStream();

        await service.exportEvents(stream, null, formats.GZIP);

        expect(progressMock).toHaveBeenCalledTimes(10)
        expect(progressMock).toHaveBeenCalledWith(1, 10)
        expect(progressMock).toHaveBeenCalledWith(10, 10)
      });

      it("export ONE is JSON", async () => {
        const { stream, getOutput } = createMockWritableStream();

        await service.exportEvents(stream, ['event-1'], formats.GZIP);
        const output = pako.inflate(await getOutput(), { to: "string" });

        expect(removeTimeDependentValues(output))
          .toBe(removeTimeDependentValues(JSON.stringify(events[0], null, 2)));
      });

      it("export not found", async () => {
        const { stream } = createMockWritableStream();

        expect(() => service.exportEvents(stream, ['event-not-found'], formats.GZIP)).rejects.toThrowError(ExportNotFoundError);
      });
    })
  })
});

const generateLdJson = (events: any[]) => {
  return events.map((event) => JSON.stringify(event)).join(LDJSON_DELIMITER);
}

const streamFromData = (data: string | Uint8Array) => {
  const encodedData = (typeof data === "string") ? new TextEncoder().encode(data) : data;

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encodedData);
      controller.close();
    },
  });
}

function createMockWritableStream(): { stream: WritableStream; getOutput: () => Promise<Uint8Array> } {
  let chunks: Uint8Array[] = [];
  const stream = new WritableStream({
    write(chunk) {
      chunks.push(chunk);
    },
  });

  return {
    stream,
    getOutput: async () => {
      return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
    },
  };
}

function removeTimeDependentValues(payload: string) {
  return payload.replace(/"lastUpdated"\s*:\s*"[^"]*"(,\s*)?/g, "");
}
