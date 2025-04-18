import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useDriveFileWatcher, useGooglePicker } from "./hook"
import { GoogleDriveService } from "~/resources/integrations/google-doc/googleDriveService"
import { createMock } from "@golevelup/ts-vitest"
import * as PickerModule from "~/resources/ui/components/google-drive/picker"


vi.mock("~/resources/ui/components/google-drive/picker", () => ({
  default: vi.fn(() => null), // mocked component that does nothing in DOM
}))

vi.mock("~/resources/integrations/google-doc/googleDriveService" , () => ({
  GoogleDriveService: {
    getInstance: vi.fn(),
  },
}))

describe("useDriveFileWatcher", () => {
  const service = createMock<GoogleDriveService>()

  beforeEach(() => {
    vi.mocked(GoogleDriveService.getInstance).mockReturnValue(service)
    vi.useFakeTimers()
    vi.spyOn(global, "setTimeout")
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("does nothing if fileId is null", () => {
    const onUpdate = vi.fn()
    renderHook(() =>
      useDriveFileWatcher(null, new Date(), onUpdate)
    )
    // just ensure no crash or side effect — no need to spy on setTimeout
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it("skips update if modifiedTime is older", async () => {
    const onUpdate = vi.fn()
    const oldDate = new Date("2023-01-01T10:00:00Z")
    const now = new Date("2023-01-01T12:00:00Z")

    service.getFileMetadata.mockResolvedValue({ modifiedTime: oldDate.toISOString() })

    renderHook(() =>
      useDriveFileWatcher("file123", now, onUpdate, 1000)
    )

    await act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(onUpdate).not.toHaveBeenCalled()
  })

  it("calls onUpdate if file was modified after import", async () => {
    const onUpdate = vi.fn()
    const modified = new Date("2023-01-01T13:00:00Z")
    const imported = new Date("2023-01-01T12:00:00Z")

    service.getFileMetadata.mockResolvedValue({ modifiedTime: modified.toISOString() })

    renderHook(() =>
      useDriveFileWatcher("file123", imported, onUpdate, 1000)
    )

    await act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(onUpdate).toHaveBeenCalledOnce()
  })

  it("retries even if an error occurs", async () => {
    const onUpdate = vi.fn()
    service.getFileMetadata.mockRejectedValue(new Error("boom"))

    renderHook(() =>
      useDriveFileWatcher("file123", new Date(), onUpdate, 1000)
    )

    await act(() => {
      vi.runOnlyPendingTimers()
    })

    // still schedules another tick
    expect(setTimeout).toHaveBeenCalled()
  })
})