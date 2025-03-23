import { describe, it, expect } from "vitest"
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"
import { mapSpreadsheetData } from "~/resources/domain/mappers/spreadsheet.mapper"

describe("mapSpreadsheetData", () => {
  const metadata: SpreadsheetMetadata = {
    filters: [],
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
        type: COLUMN_TYPE.LAST_NAME
      },
      {
        name: "Archetype",
        originalName: "Commander Name",
        index: 2,
        type: COLUMN_TYPE.ARCHETYPE
      },
      {
        name: "FOO",
        originalName: "FOO",
        index: 3,
        type: COLUMN_TYPE.IGNORED_DATA
      },
      {
        name: "Decklist URL",
        originalName: "deck url",
        index: 4,
        type: COLUMN_TYPE.DECKLIST_URL
      }
    ]
  } as SpreadsheetMetadata

  it("should map spreadsheet rows to structured data", async () => {
    const rawData = [
      ["Alice", "Smith", "Burn", "ignore-me", "https://moxfield.com/deck1"],
      ["Bob", "Jones", "Control", "ignore-me", "https://moxfield.com/deck2"],
    ]

    const result = await mapSpreadsheetData(rawData, metadata)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      firstName: "Alice",
      lastName: "Smith",
      archetype: "Burn",
      decklistUrl: "https://moxfield.com/deck1",
    })
    expect(result[1]).toMatchObject({
      firstName: "Bob",
      lastName: "Jones",
      archetype: "Control",
      decklistUrl: "https://moxfield.com/deck2",
    })
  })

  it("should return empty array for invalid input", async () => {
    expect(await mapSpreadsheetData([], metadata)).toEqual([])

    const poor = await mapSpreadsheetData([["Nuk Nuk Nuk"]], metadata)
    expect(poor).toHaveLength(1)
    expect(poor[0].firstName).toEqual("Nuk Nuk Nuk")
  })
})
