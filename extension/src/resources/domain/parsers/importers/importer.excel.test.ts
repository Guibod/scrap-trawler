import { describe, it, expect } from "vitest"
import type { SpreadsheetRawData } from "~/resources/domain/dbos/spreadsheet.dbo"
import * as XLSX from "xlsx";
import type { EventModel } from "~/resources/domain/models/event.model"
import { ImporterExcel } from "~/resources/domain/parsers/importers/importer.excel"
import { File } from "fetch-blob/file"

const defaultData: SpreadsheetRawData = [
  ["Name", "Age"],
  ["Guibod", "999"]
]

function createTestFile(data: SpreadsheetRawData = defaultData, name = "file.xlsx"): File {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  return new File(
    [XLSX.write(wb, { type: "array", bookType: "xlsx" })],
    name,
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  )
}


describe("ImporterExcel", () => {
  describe("parse", () => {
    it("parses .xlsx file and extracts columns + rows", async () => {
      const importer = new ImporterExcel({
        metadata: {
          sheetId: "Sheet1",
          sheetName: "Sheet1",
        },
        file: createTestFile(),
      })
      const result = await importer.parse()
      expect(result.columns.map(c => c.name)).toEqual(["Name", "Age"])
      expect(result.rows).toEqual([["Guibod", "999"]])
    })


    it("parses .xlsx file and extracts columns + rows with autodetection", async () => {
      const importer = new ImporterExcel({
        metadata: {
          autodetect: true,
          sheetId: "Sheet1",
          sheetName: "Sheet1",
        },
        file: createTestFile(),
        event: {
          players: {
            "g": {
              firstName: "Guibod",
              lastName: "Tocard"
            }
          }
        } as unknown as EventModel
      })

      const result = await importer.parse()
      expect(result.columns.map(c => c.name)).toEqual(["Name", "Age"])
      expect(result.columns[0].type).toEqual("firstName")
      expect(result.rows).toEqual([["Guibod", "999"]])
    })


    it("prunes extra columns and rows", async () => {
      const importer = new ImporterExcel({
        metadata: {
          sheetId: "Sheet1",
          sheetName: "Sheet1",
        },
        file: createTestFile([
          ["Name", "Age", "", "Extra", "", ""],
          ["", "", "", "", "", ""],
          ["Guibod", "999", "", "", "", ""],
          ["", "", "", "", "", ""],
        ])
      })
      const result = await importer.parse()
      expect(result.columns.map(c => c.name)).toEqual(["Name", "Age", "Ignored #3", "Extra"])
      expect(result.rows).toEqual([
        ["", "", "", ""],
        ["Guibod", "999", "", ""]
      ])
    })
  })

  describe("canHandle", () => {
    it("canHandle returns true only for .xlsx files", () => {
      expect(ImporterExcel.canHandle({
        metadata: {},
        file: new File([], "test.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      })).toBe(true)
    })

    it("canHandle returns false for non-.xlsx files", () => {
      expect(ImporterExcel.canHandle({
        metadata: {},
        file: new File([], "test.csv", { type: "text/csv" }),
      })).toBe(false)
    })
  })
})