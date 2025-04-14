import { describe, it, expect, vi, beforeEach } from "vitest"
import { ImporterGoogleUrl } from "./importer.google.url"
import { GoogleSheetsService } from "~/resources/integrations/google-doc/spreadsheet.service"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"

vi.mock("~/resources/integrations/google-doc/spreadsheet.service", () => ({
  GoogleSheetsService: {
    isSpreadsheetUrl: vi.fn(),
    parseSheetUrl: vi.fn(),
    getInstance: vi.fn()
  }
}))

describe("ImporterGoogle", () => {
  const mockUrl = "https://docs.google.com/spreadsheets/d/mock-id/edit#gid=123456"
  const mockSheetId = "mock-id"
  const mockGid = "123456"
  const mockData = [
    ["Name", "Age"],
    ["Guibod", "999"]
  ]

  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(GoogleSheetsService.isSpreadsheetUrl).mockReturnValue(true)
    vi.mocked(GoogleSheetsService.parseSheetUrl).mockReturnValue({ sheetId: mockSheetId, gid: mockGid })
    vi.mocked(GoogleSheetsService.getInstance).mockReturnValue({
      fetchRange: vi.fn().mockResolvedValue(mockData)
    } as unknown as GoogleSheetsService)
  })

  it("canHandle returns true for valid Google Sheets URL", () => {
    expect(ImporterGoogleUrl.canHandle({ source: mockUrl } as SpreadsheetMetadata)).toBe(true)
  })

  it("parses Google Sheet via sync()", async () => {
    const importer = new ImporterGoogleUrl({ source: mockUrl, columns: [] } as SpreadsheetMetadata)
    const result = await importer.sync({ source: mockUrl } as SpreadsheetMetadata)
    expect(result.columns.map(c => c.name)).toEqual(["Name", "Age"])
    expect(result.rows).toEqual([["Guibod", "999"]])
  })

  it("parses Google Sheet via parse(data)", async () => {
    const importer = new ImporterGoogleUrl({ source: mockUrl, columns: [] } as SpreadsheetMetadata)
    const result = await importer.parse(new TextEncoder().encode(mockUrl).buffer)
    expect(result.columns.map(c => c.name)).toEqual(["Name", "Age"])
    expect(result.rows).toEqual([["Guibod", "999"]])
  })
})
