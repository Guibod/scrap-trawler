import { describe, it, expect } from "vitest"
import { ImporterExcel } from "../importers/importer.excel"
import type { SpreadsheetMetadata, SpreadsheetRawData } from "~/resources/domain/dbos/spreadsheet.dbo"
import * as XLSX from "xlsx";
import type { EventModel } from "~/resources/domain/models/event.model"

const defaultData: SpreadsheetRawData = [
  ["Name", "Age"],
  ["Guibod", "999"]
]

function createTestXlsxBuffer(data: SpreadsheetRawData = defaultData): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  return XLSX.write(wb, { type: "array", bookType: "xlsx" })
}

describe("ImporterExcel", () => {
  it("parses .xlsx file and extracts columns + rows", async () => {
    const importer = new ImporterExcel({ source: "file.xlsx", columns: [] } as SpreadsheetMetadata)
    const result = await importer.parse(createTestXlsxBuffer())
    expect(result.columns.map(c => c.name)).toEqual(["Name", "Age"])
    expect(result.rows).toEqual([["Guibod", "999"]])
  })


  it("parses .xlsx file and extracts columns + rows with autodetection", async () => {
    const importer = new ImporterExcel({ source: "file.xlsx", columns: [] } as SpreadsheetMetadata)
    importer.enableAutoDetectColumns({
      players: {
        "g": {
          firstName: "Guibod",
          lastName: "Tocard"
        }
      }
    } as unknown as EventModel)
    const result = await importer.parse(createTestXlsxBuffer())
    expect(result.columns.map(c => c.name)).toEqual(["Name", "Age"])
    expect(result.columns[0].type).toEqual("firstName")
    expect(result.rows).toEqual([["Guibod", "999"]])
  })


  it("prunes extra columns and rows", async () => {
    const importer = new ImporterExcel({ source: "file.xlsx", columns: [] } as SpreadsheetMetadata)
    const result = await importer.parse(createTestXlsxBuffer([
      ["Name", "Age", "", "Extra", "", ""],
      ["", "", "", "", "", ""],
      ["Guibod", "999", "", "", "", ""],
      ["", "", "", "", "", ""],
    ]))
    expect(result.columns.map(c => c.name)).toEqual(["Name", "Age", "", "Extra"])
    expect(result.rows).toEqual([
      ["", "", "", ""],
      ["Guibod", "999", "", ""]
    ])
  })

  it("canHandle returns true only for .xlsx files", () => {
    expect(ImporterExcel.canHandle({ source: "test.xlsx" } as SpreadsheetMetadata)).toBe(true)
    expect(ImporterExcel.canHandle({ source: "test.csv" } as SpreadsheetMetadata)).toBe(false)
  })
})
