import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import DriveSpreadsheetPickerButton from "./button"
import { OAuthService } from "~/resources/integrations/google-oauth/oauth.service"
import { GoogleDriveService } from "~/resources/integrations/google-doc/googleDriveService"
import { type EventSetupContextType, useEventSetup } from "~/resources/ui/components/event/setup/provider"
import type { SpreadsheetMetadata } from "~/resources/domain/dbos/spreadsheet.dbo"

vi.mock("~/resources/integrations/google-oauth/oauth.service", () => ({
  OAuthService: { getInstance: vi.fn() }
}))

vi.mock("~/resources/integrations/google-doc/googleDriveService", () => ({
  GoogleDriveService: {
    getInstance: vi.fn(),
    extractGoogleDriveFileId: vi.fn()
  }
}))

vi.mock("~/resources/ui/components/event/setup/provider", () => ({
  useEventSetup: vi.fn()
}))

describe("<DriveSpreadsheetPickerButton />", () => {
  const mockImport = vi.fn()
  const mockClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useEventSetup).mockReturnValue({
      handleImport: mockImport,
      spreadsheetMeta: { source: null } as SpreadsheetMetadata
    } as unknown as EventSetupContextType)
    vi.mocked(OAuthService.getInstance).mockReturnValue({
      getGoogleApiToken: vi.fn().mockResolvedValue("token")
    } as unknown as OAuthService)
    vi.mocked(GoogleDriveService.extractGoogleDriveFileId).mockReturnValue("file123")
  })

  it("renders and opens modal on click after auth", async () => {
    render(
      <DriveSpreadsheetPickerButton
        metadata={{ autodetect: true } as any}
      />
    )

    const btn = screen.getByRole("button", { name: /pick a google drive file/i })
    await userEvent.click(btn)

    expect(OAuthService.getInstance().getGoogleApiToken).toHaveBeenCalled()
    await screen.findByText("Pick a Google Sheet") // modal opens
  })

  it("handles pickerResult with valid URL", async () => {
    render(
      <DriveSpreadsheetPickerButton
        metadata={{ autodetect: true } as any}
      />
    )

    await userEvent.click(screen.getByRole("button"))

    const msg = new MessageEvent("message", {
      data: { m: "pickerResult", url: "https://drive.google.com/file/abc" }
    })

    await act(async () => {
      window.dispatchEvent(msg)
    })

    await waitFor(() => {
      expect(mockImport).toHaveBeenCalledWith({
        metadata: { sourceType: "drive", source: "file123", autodetect: true }
      })
    })
  })

  it("ignores pickerResult with no URL", async () => {
    render(
      <DriveSpreadsheetPickerButton
        metadata={{ autodetect: true } as any}
      />
    )

    window.dispatchEvent(new MessageEvent("message", { data: { m: "pickerResult", url: null } }))
    expect(mockImport).not.toHaveBeenCalled()
  })

  it("handles invalid drive ID parsing", async () => {
    vi.mocked(GoogleDriveService.extractGoogleDriveFileId).mockReturnValue(null)

    render(
      <DriveSpreadsheetPickerButton
        metadata={{ autodetect: true } as any}
      />
    )

    await userEvent.click(screen.getByRole("button"))

    const msg = new MessageEvent("message", {
      data: { m: "pickerResult", url: "bad url" }
    })

    window.dispatchEvent(msg)

    expect(mockImport).not.toHaveBeenCalled()
  })
})
