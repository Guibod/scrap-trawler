import { describe, expect, it, vi } from "vitest"
import { ImporterUtils } from "~/resources/domain/parsers/importers/utils"
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"

describe("ImporterUtils", () => {
  describe("createDefaultMetadata", () => {
    it("should throw if no file and no sourceType", () => {
      expect(() =>
        ImporterUtils.createDefaultMetadata({ metadata: {} as SpreadsheetMetadata })
      ).toThrow("No source type or file provided")
    })

    it("should not prefer file over metadata source", () => {
      const result = ImporterUtils.createDefaultMetadata({
        metadata: { sourceType: "drive" } as SpreadsheetMetadata,
        file: new File(["test"], "myfile.csv")
      })
      expect(result.sourceType).toBe("drive")
      expect(result.name).toBe("myfile.csv")
    })

    it("should use metadata values if file is missing", () => {
      const result = ImporterUtils.createDefaultMetadata({
        metadata: { sourceType: "file", source: "abc" }
      })
      expect(result.sourceType).toBe("file")
      expect(result.source).toBe("abc")
    })
  })

  describe("extractKnownNames", () => {
    it("should return empty sets if event is null", () => {
      const result = ImporterUtils.extractKnownNames(null as EventModel)
      expect(result.firstNames.size).toBe(0)
      expect(result.lastNames.size).toBe(0)
    })

    it("should collect trimmed first and last names", () => {
      const event = {
        players: {
          p1: { firstName: " Alice ", lastName: " Smith " },
          p2: { firstName: "Bob", lastName: "Smith" }
        }
      } as unknown as EventModel
      const result = ImporterUtils.extractKnownNames(event)
      expect(result.firstNames).toEqual(new Set(["Alice", "Bob"]))
      expect(result.lastNames).toEqual(new Set(["Smith"]))
    })

    it("should ignore non-string names", () => {
      const event = {
        players: {
          p1: { firstName: 123, lastName: null },
          p2: {}
        }
      } as unknown as EventModel
      const result = ImporterUtils.extractKnownNames(event)
      expect(result.firstNames.size).toBe(0)
      expect(result.lastNames.size).toBe(0)
    })
  })

  describe("normalizeRows", () => {
    it("should remove trailing empty rows", () => {
      const rows = [["a"], ["b"], [""], [" "], []]
      const result = ImporterUtils.normalizeRows(rows)
      expect(result).toEqual([["a"], ["b"]])
    })

    it("should remove trailing empty columns", () => {
      const rows = [
        ["a", "b", "", ""],
        ["c", "", "", ""],
        ["", "", "", ""]
      ]
      const result = ImporterUtils.normalizeRows(rows)
      expect(result).toEqual([
        ["a", "b"],
        ["c", ""],
      ])
    })

    it("should preserve all if no trailing empty rows/columns", () => {
      const rows = [
        ["a", "b"],
        ["c", "d"]
      ]
      expect(ImporterUtils.normalizeRows(rows)).toEqual(rows)
    })
  })

  describe("computeColumns", () => {
    const baseColumns = ["First", "Last", "Deck"]

    it("should handle SPARSE columns gracefully", () => {
      const columns = Array(6)
      columns[1] = "Second"
      columns[5] = "Sixth"

      const result = ImporterUtils.computeColumns(
        columns,
        [],
        { firstNames: new Set(), lastNames: new Set() },
        true,
        []
      )
      expect(result).toEqual([
        {
          "index": 0,
          "name": "Ignored #1",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 1,
          "name": "Second",
          "originalName": "Second",
          "type": "ignored",
        },
        {
          "index": 2,
          "name": "Ignored #3",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 3,
          "name": "Ignored #4",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 4,
          "name": "Ignored #5",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 5,
          "name": "Sixth",
          "originalName": "Sixth",
          "type": "ignored",
        },
      ])
    })

    it("should handle column without name gracefully, if no previous", () => {
      const result = ImporterUtils.computeColumns(
        ["", "", "Deck", "", "Name"],
        [],
        { firstNames: new Set(), lastNames: new Set() },
        true,
        []
      )
      expect(result).toEqual([
        {
          "index": 0,
          "name": "Ignored #1",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 1,
          "name": "Ignored #2",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 2,
          "name": "Deck",
          "originalName": "Deck",
          "type": "ignored",
        },
        {
          "index": 3,
          "name": "Ignored #4",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 4,
          "name": "Name",
          "originalName": "Name",
          "type": "ignored",
        }
      ])
    })

    it("should handle column without name gracefully, if previous", () => {
      const result = ImporterUtils.computeColumns(
        ["", "", "Deck", "", "Name"],
        [],
        { firstNames: new Set(), lastNames: new Set() },
        true,
        [
          {
            "index": 0,
            "name": "Ignored #1",
            "originalName": "",
            "type": COLUMN_TYPE.IGNORED_DATA,
          },
          {
            "index": 1,
            "name": "Fubar",
            "originalName": "Fubar",
            "type": COLUMN_TYPE.IGNORED_DATA,
          },
          {
            "index": 2,
            "name": "Deck",
            "originalName": "Deck",
            "type": COLUMN_TYPE.IGNORED_DATA,
          },
          {
            "index": 3,
            "name": "Ignored #4",
            "originalName": "",
            "type": COLUMN_TYPE.IGNORED_DATA,
          },
          {
            "index": 4,
            "name": "Name",
            "originalName": "Name",
            "type": COLUMN_TYPE.IGNORED_DATA,
          }
        ]
      )
      expect(result).toEqual([
        {
          "index": 0,
          "name": "Ignored #1",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 1,
          "name": "Fubar",
          "originalName": "Fubar",
          "type": "ignored",
        },
        {
          "index": 2,
          "name": "Deck",
          "originalName": "Deck",
          "type": "ignored",
        },
        {
          "index": 3,
          "name": "Ignored #4",
          "originalName": "",
          "type": "ignored",
        },
        {
          "index": 4,
          "name": "Name",
          "originalName": "Name",
          "type": "ignored",
        }
      ])
    })

    it("should return empty array if columns is undefined", () => {
      const result = ImporterUtils.computeColumns(
        undefined,
        [],
        { firstNames: new Set(), lastNames: new Set() },
        true,
        []
      )
      expect(result).toEqual([])
    })

    it("should fallback to IGNORED with fallback name", () => {
      const result = ImporterUtils.computeColumns(
        [...baseColumns, ""],
        [],
        { firstNames: new Set(), lastNames: new Set() },
        false,
        []
      )
      expect(result[3].name).toMatch(/^Ignored #/)
      expect(result[3].type).toBe(COLUMN_TYPE.IGNORED_DATA)
    })

    it("should use previousColumns if available", () => {
      const result = ImporterUtils.computeColumns(
        baseColumns,
        [],
        { firstNames: new Set(), lastNames: new Set() },
        false,
        [{ originalName: "Deck", name: "Decklist", index: 2, type: COLUMN_TYPE.DECKLIST_URL }]
      )
      expect(result[2].name).toBe("Decklist")
    })

    it("should trim column names and still match original", () => {
      const trimmed = [" First ", " Last ", " Deck "]
      const result = ImporterUtils.computeColumns(
        trimmed,
        [],
        { firstNames: new Set(), lastNames: new Set() },
        false,
        []
      )
      expect(result[0].name).toBe("First")
    })

    it("should use detector output if autodetect is enabled", () => {
      const detector = {
        detectColumns: vi.fn().mockReturnValue(new Map([[0, COLUMN_TYPE.FIRST_NAME]]))
      }
      vi.stubGlobal("SpreadsheetColumnDetector", vi.fn().mockImplementation(() => detector))

      const result = ImporterUtils.computeColumns(
        baseColumns,
        [["Alice"]],
        { firstNames: new Set(["Alice"]), lastNames: new Set() },
        true,
        []
      )
      expect(result[0].type).toBe(COLUMN_TYPE.FIRST_NAME)

      vi.unstubAllGlobals()
    })
  })
})
