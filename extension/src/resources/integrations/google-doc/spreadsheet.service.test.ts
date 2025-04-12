import { describe, it, beforeEach, vi, expect } from "vitest"
import { OauthService } from "~/resources/integrations/google-oauth/oauth.service"
import { GoogleSheetsService } from "~/resources/integrations/google-doc/spreadsheet.service"
import { createMock } from "@golevelup/ts-vitest"

vi.mock("~/resources/logging/logger", () => ({
  getLogger: () => ({
    debug: vi.fn(),
    error: vi.fn()
  })
}))

const mockToken = "ya29.fake-token"
const fakeSheetId = "fake-sheet-id"
const fakeGid = "123456"
const fakeSheetName = "MySheet"
const fakeRange = "A1:B2"
const fakeValues = [["Name", "Age"], ["Guibod", "999"]]

describe("GoogleSheetService", () => {
  let oauth: OauthService
  let service: GoogleSheetsService

  beforeEach(() => {
    vi.resetAllMocks()
    oauth = createMock<OauthService>({
      getGoogleApiToken: vi.fn().mockResolvedValue(mockToken)
    });
    (GoogleSheetsService as any).instance = undefined
    service = GoogleSheetsService.getInstance(oauth)
  })

  describe('isSpreadsheetUrl', ()=> {
    it("parses valid sheet URL with gid as a anchor", () => {
      const url = `https://docs.google.com/spreadsheets/d/abcd/edit#gid=efghijk`
      expect(GoogleSheetsService.isSpreadsheetUrl(url)).toBe(true)
    })

    it("parses valid sheet URL with gid as a query param", () => {
      const url = `https://docs.google.com/spreadsheets/d/abcd/edit?gid=efghijk`
      expect(GoogleSheetsService.isSpreadsheetUrl(url)).toBe(true)
    })

    it("parses valid sheet URL without gid", () => {
      const url = `https://docs.google.com/spreadsheets/d/abcd`
      expect(GoogleSheetsService.isSpreadsheetUrl(url)).toBe(true)
    })

    it("support null", () => {
      expect(GoogleSheetsService.isSpreadsheetUrl(null)).toBe(false)
    })

    it("support undefined", () => {
      expect(GoogleSheetsService.isSpreadsheetUrl(null)).toBe(false)
    })

    it("support another domain url", () => {
      expect(GoogleSheetsService.isSpreadsheetUrl("https://example.com")).toBe(false)
    })
  })

  describe("parseSheetUrl", () => {
    it("parses valid sheet URL with gid as a anchor", () => {
      const url = `https://docs.google.com/spreadsheets/d/abcd/edit#gid=efghijk`
      const result = GoogleSheetsService.parseSheetUrl(url)
      expect(result).toEqual({ sheetId: "abcd", gid: "efghijk" })
    })

    it("parses valid sheet URL with gid as a query parameter", () => {
      const url = `https://docs.google.com/spreadsheets/d/abcd/edit?gid=efghijk`
      const result = GoogleSheetsService.parseSheetUrl(url)
      expect(result).toEqual({ sheetId: "abcd", gid: "efghijk" })
    })

    it("parses URL without gid, defaults to 0", () => {
      const url = `https://docs.google.com/spreadsheets/d/foo`
      const result = GoogleSheetsService.parseSheetUrl(url)
      expect(result).toEqual({ sheetId: "foo", gid: "0" })
    })

    it("throws on invalid URL", () => {
      expect(() => GoogleSheetsService.parseSheetUrl("not-a-url")).toThrow("Invalid Google Sheet URL")
    })

    it("throws on URL missing /d/<id>", () => {
      expect(() => GoogleSheetsService.parseSheetUrl("https://google.com")).toThrow("missing /spreadsheets/d/<id>")
    })
  })

  describe("fetchRange", () => {
    it("fetches sheet metadata and values", async () => {
      const metadata = {
        sheets: [{ properties: { sheetId: Number(fakeGid), title: fakeSheetName } }]
      }
      const rangeResponse = { values: fakeValues }

      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce(new Response(JSON.stringify(metadata), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(rangeResponse), { status: 200 }))

      const values = await service.fetchRange(fakeSheetId, fakeGid, fakeRange)
      expect(values).toEqual(fakeValues)

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(fakeSheetId), expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
      }))
    })

    it("throws if metadata fetch fails", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(null, { status: 403, statusText: "Forbidden" }))
      await expect(service.fetchRange(fakeSheetId)).rejects.toThrow("Failed to fetch sheet metadata: Forbidden")
    })

    it("throws if gid is not found in metadata", async () => {
      const metadata = {
        sheets: [{ properties: { sheetId: 111, title: "OtherSheet" } }]
      }
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(new Response(JSON.stringify(metadata), { status: 200 }))
      await expect(service.fetchRange(fakeSheetId, fakeGid)).rejects.toThrow(`No sheet found with gid ${fakeGid}`)
    })

    it("throws if data fetch fails", async () => {
      const metadata = {
        sheets: [{ properties: { sheetId: Number(fakeGid), title: fakeSheetName } }]
      }
      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce(new Response(JSON.stringify(metadata), { status: 200 }))
        .mockResolvedValueOnce(new Response(null, { status: 500, statusText: "Server Error" }))

      await expect(service.fetchRange(fakeSheetId, fakeGid)).rejects.toThrow("Google Sheets fetch failed: Server Error")
    })
  })
})
