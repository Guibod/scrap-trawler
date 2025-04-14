import { describe, it, expect } from "vitest"
import { COLUMN_TYPE, FILTER_OPERATOR, DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"
import type { SpreadsheetMetadata, SpreadsheetRawData } from "~/resources/domain/dbos/spreadsheet.dbo"
import { SpreadsheetDataFactory } from "~/resources/domain/parsers/spreadsheet.data.factory"

describe("SpreadsheetDataFactory", () => {
  const baseMeta: SpreadsheetMetadata = {
    source: "test",
    sourceType: "file",
    name: 'test.csv' ,
    autodetect: false,
    sheetId: "test",
    sheetName: "test",
    finalized: false,
    importedAt: null,
    columns: [
      {
        name: "First Name",
        originalName: "First Name",
        index: 0,
        type: COLUMN_TYPE.FIRST_NAME
      },
      {
        name: "Last Name",
        originalName: "Last Name",
        index: 1,
        type: COLUMN_TYPE.LAST_NAME,
      },
      {
        name: "Archetype",
        originalName: "Commander Name",
        index: 2,
        type: COLUMN_TYPE.ARCHETYPE,
      },
      {
        name: "Deck",
        originalName: "Deck",
        index: 3,
        type: COLUMN_TYPE.DECKLIST_URL
      },
      {
        name: "Unique",
        originalName: "Unique",
        index: 4,
        type: COLUMN_TYPE.UNIQUE_ID
      }
    ],
    filters: [],
    duplicateStrategy: DUPLICATE_STRATEGY.NONE,
    format: null
  }

  const rawData: SpreadsheetRawData = [
    ["Alice", "Smith", "Burn", "url1", "unique1"],
    ["Bob", "Smith", "Control", "url2", "unique2"],
    ["Alice", "Smith", "Burn", "url1", "unique1"], // duplicate
  ]


  it("should transform raw data correctly", async () => {
    const factory = new SpreadsheetDataFactory(baseMeta, rawData)
    const data = await factory.generate()

    expect(data).toHaveLength(3)
    expect(data?.[0].firstName).toBe("Alice")
    expect(data?.[1].archetype).toBe("Control")
  })

  it("should apply filters correctly", async () => {
    const meta: SpreadsheetMetadata = {
      ...baseMeta,
      filters: [
        {
          column: 2,
          operator: FILTER_OPERATOR.EQUALS,
          values: ["Burn"]
        }
      ]
    }
    const factory = new SpreadsheetDataFactory(meta, rawData)
    const data = await factory.generate()

    expect(data).toHaveLength(2)
    data?.forEach(row => {
      expect(row.archetype).toBe("Burn")
    })
  })

  it("should deduplicate rows with KEEP_FIRST strategy", async () => {
    const meta = {
      ...baseMeta,
      duplicateStrategy: DUPLICATE_STRATEGY.KEEP_FIRST
    }
    const factory = new SpreadsheetDataFactory(meta, rawData)
    const data = await factory.generate()

    expect(data).toHaveLength(2)
  })

  it("should handle empty or invalid input safely", async () => {
    const factory = new SpreadsheetDataFactory(baseMeta, [[]])
    const data = await factory.generate()

    expect(data).toEqual( [
         {
           "archetype": "",
           "decklistTxt": "",
           "decklistUrl": "",
           "firstName": "",
           "id": "b6589fc6ab0dc82cf12099d1c2d40ab994e8410c",
           "lastName": "",
           "player": {},
       },
     ]
  )
  })
})
