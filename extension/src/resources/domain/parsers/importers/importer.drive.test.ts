import { beforeEach, describe, expect, it, vi } from "vitest"
import { ImporterGoogleDrive } from "~/resources/domain/parsers/importers/importer.drive"
import type { SpreadsheetImportRequest, SheetTab } from "~/resources/domain/parsers/importers/types"
import { ImporterExcel } from "~/resources/domain/parsers/importers/importer.excel"
import { DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"

vi.mock("~/resources/domain/parsers/importers/importer.excel", () => ({
  ImporterExcel: {
    pickSheet: vi.fn(),
    extractSheet: vi.fn()
  }
}))

vi.mock("~/resources/integrations/google-oauth/oauth.service", () => {
  return {
    OauthService: {
      getInstance: vi.fn(() => ({
        getGoogleApiToken: vi.fn().mockResolvedValue("token-xyz"),
        clearCachedToken: vi.fn()
      }))
    }
  }
})

// ─────────────────────────────────────────────────────────────────────────────

describe("ImporterGoogleDrive", () => {
  const MOCK_FILE_BLOB = new Blob(["fake xlsx content"], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  })

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(ImporterExcel.pickSheet).mockResolvedValue({
      id: "0",
      title: "Main",
      index: 0,
      hidden: false,
      rowCount: 12,
      columnCount: 5
    })
    global.fetch = vi.fn().mockResolvedValue(new Response(MOCK_FILE_BLOB))
  })

  const makeRequest = (): SpreadsheetImportRequest => ({
    metadata: {
      sourceType: "drive",
      source: "abc123",
      sheetId: null,
      sheetName: null,
      columns: [],
      filters: [],
      autodetect: false,
      finalized: false,
      duplicateStrategy: DUPLICATE_STRATEGY.NONE,
      format: null,
      name: "Decklists"
    }
  })

  it("prepares and sets metadata from picker and Excel fallback", async () => {
    const importer = new ImporterGoogleDrive(makeRequest())

    const fakeSheet: SheetTab = {
      id: "0",
      title: "Main",
      index: 0,
      hidden: false,
      rowCount: 12,
      columnCount: 5
    }

    vi.mocked(ImporterExcel.pickSheet).mockResolvedValue(fakeSheet)

    await importer.prepare()

    expect(importer.metadata.source).toBe("abc123")
    expect(importer.metadata.name).toBe("Decklists")
    expect(importer.metadata.sheetId).toBe("0")
    expect(importer.metadata.sheetName).toBe("Main")
  })

  it("parses data using ImporterExcel.extractSheet", async () => {
    const importer = new ImporterGoogleDrive(makeRequest())

    importer["downloadDriveSheetAsXlsx"] = vi.fn().mockResolvedValue(MOCK_FILE_BLOB)

    // Preload metadata
    importer["metadata"].sheetId = "0"
    importer["metadata"].sheetName = "Main"

    const mockData = [
      ["Name", "Deck"],
      ["Alice", "Burn"],
      ["Bob", "Control"]
    ]

    vi.mocked(ImporterExcel.extractSheet).mockResolvedValue(mockData)

    const result = await importer.parse()

    expect(result.columns).toEqual([
      { name: "Name", originalName: "Name", index: 0, type: "ignored" },
      { name: "Deck", originalName: "Deck", index: 1, type: "ignored" }
    ])

    expect(result.rows).toEqual([
      ["Alice", "Burn"],
      ["Bob", "Control"]
    ])
  })
})
