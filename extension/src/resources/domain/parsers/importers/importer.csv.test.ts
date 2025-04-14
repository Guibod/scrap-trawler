import { describe, expect, it } from "vitest"
import type { EventModel } from "~/resources/domain/models/event.model"
import { ImporterCsv } from "~/resources/domain/parsers/importers/importer.csv"
import { File } from "fetch-blob/file"

const sampleEvent = {
  players: {
    a: {firstName: "Alice", lastName: "Smith"},
    b: {firstName: "Bob", lastName: "Smith"},
    c: {firstName: "Charles", lastName: "Jones"},
    d: {firstName: "Didier", lastName: "Smith"},
  }
} as unknown as EventModel

describe("ImporterCsv", () => {
  describe("canHandle", () => {
    it("returns true for .csv files", () => {
      expect(ImporterCsv.canHandle(
        {
          metadata: {},
          file: new File([], 'foo.csv', { type: "text/csv" }),
        }
      )).toBe(true);
    })

    it("returns false for non-.csv files", () => {
      expect(ImporterCsv.canHandle(
        {
          metadata: {},
          file: new File([], 'foo.txt', { type: "text/plain" }),
        }
      )).toBe(false);
    })

    it("returns false for source .csv, we only trust the file", () => {
      expect(ImporterCsv.canHandle(
        {
          metadata: {
            source: "foo.csv"
          },
          file: new File([], 'foo.txt', { type: "text/plain" }),
        }
      )).toBe(false);
    })
  })

  describe("parse", () => {
    it("parses a simple CSV with headers", async () => {
      const parser = new ImporterCsv(
        {
          metadata: {
            sourceType: 'file',
            autodetect: true
          },
          file: new File([
            "f-i-r-s-t-n-a-m-e,deck\n",
            "Alice,Gruul Aggro\n",
            "Bob,Dimir Control\n",
            "Charles,Dimir Control\n",
            "Didier,Boros Burn\n"
            ], 'foo.csv', { type: "text/csv" }),
          event: sampleEvent
        }
      );
      const result = await parser.parse();

      expect(result.columns).toEqual([
        {
          "index": 0,
          "name": "f-i-r-s-t-n-a-m-e",
          "originalName": "f-i-r-s-t-n-a-m-e",
          "type": 'firstName',
        },
        {
          "index": 1,
          "name": "deck",
          "originalName": "deck",
          "type": expect.anything(),
        },
      ]);
      expect(result.rows[0]).toEqual(
        ["Alice", "Gruul Aggro"],
      );
    });

    it("returns empty rows for empty CSV", async () => {
      const parser = new ImporterCsv(
        {
          metadata: {
            sourceType: 'file',
            autodetect: false
          },
          file: new File([], 'foo.csv', { type: "text/csv" }),
          event: sampleEvent
        }
      );

      const result = await parser.parse()

      expect(result.columns).toEqual([]);
      expect(result.rows).toEqual([]);
    });

    it("No file", async () => {
      const parser = new ImporterCsv(
        {
          metadata: {
            source: 'foo.csv',
            sourceType: 'file',
            autodetect: false
          },
          event: sampleEvent
        }
      );

      await expect(parser.parse()).rejects.toThrow("No file provided");
    });

    it("handles extra columns gracefully", async () => {
      const parser = new ImporterCsv(
        {
          metadata: {
            sourceType: 'file',
            autodetect: true
          },
          file: new File([
            "name,deck,email\n",
            "Charlie,Mono Green,charlie@example.com\n",
            "Dana,Boros Burn,dana@example.com\n"
          ], 'foo.csv', {type: "text/csv"}),
          event: sampleEvent
        }
      );

      const result = await parser.parse();
      expect(result.columns).toEqual([
        {
          "index": 0,
          "name": "name",
          "originalName": "name",
          "type": expect.anything(),
        },
        {
          "index": 1,
          "name": "deck",
          "originalName": "deck",
          "type": expect.anything(),
        },
        {
          "index": 2,
          "name": "email",
          "originalName": "email",
          "type": "uniqueId",
        },
      ]);
      expect(result.rows[0][0]).toBe("Charlie");
      expect(result.rows[0][2]).toBe("charlie@example.com");
    });
  })
});

