import { describe, it, expect } from "vitest"
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo"
import { mapSpreadsheet } from "~/resources/domain/mappers/spreadsheet.mapper"
import type { SpreadsheetMetadataEntity } from "~/resources/storage/entities/event.entity"

describe("mapSpreadsheetData", () => {
  const metadata: SpreadsheetMetadataEntity = {
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
  } as SpreadsheetMetadataEntity

  it("should map spreadsheet rows to structured data", async () => {
    const rawData = [
      ["Alice", "Smith", "Burn", "ignore-me", "https://moxfield.com/deck1"],
      ["Bob", "Jones", "Control", "ignore-me", "https://moxfield.com/deck2"],
    ]

    const result = await mapSpreadsheet(metadata, rawData)

    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toMatchObject({
      firstName: "Alice",
      lastName: "Smith",
      archetype: "Burn",
      decklistUrl: "https://moxfield.com/deck1",
    })
    expect(result.data[1]).toMatchObject({
      firstName: "Bob",
      lastName: "Jones",
      archetype: "Control",
      decklistUrl: "https://moxfield.com/deck2",
    })
  })

  it("should return empty array for invalid input", async () => {
    const empty = await mapSpreadsheet(metadata, [])
    expect(empty.data).toEqual([])

    const poor = await mapSpreadsheet( metadata, [["Nuk Nuk Nuk"]])
    expect(poor.data).toHaveLength(1)
    expect(poor.data[0].firstName).toEqual("Nuk Nuk Nuk")
  })
})
