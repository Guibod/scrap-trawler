import { describe, it, expect, vi } from "vitest"
import { exportEventsToFile, importEventsFromFile } from "./export"
import { ImportExportService } from "~/resources/domain/import.export.service"
import { handleFileDownload } from "~/resources/utils/download"

vi.mock("~/resources/utils/download", () => ({
  handleFileDownload: vi.fn()
}))


describe("export.ts", () => {
  it("calls exportEvents and triggers download", async () => {
    const service = {
      exportEvents: vi.fn(),
      onProgress: vi.fn()
    } as unknown as ImportExportService

    await exportEventsToFile(["evt-1"], vi.fn(), service)

    expect(service.exportEvents).toHaveBeenCalled()
    expect(vi.mocked(handleFileDownload)).toHaveBeenCalled()
  })

  it("calls importEvents with file stream", async () => {
    const service = {
      importEvents: vi.fn(),
      onProgress: vi.fn()
    } as unknown as ImportExportService


    const stream = vi.fn()
    const file = { stream } as unknown as File

    await importEventsFromFile(file, vi.fn(), service)

    expect(service.importEvents).toHaveBeenCalledWith(stream())
  })
})