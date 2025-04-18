import { vi, describe, it, beforeEach, expect } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import userEvent from "@testing-library/user-event"
import { DriveAccessSummary } from "./summary"
import { GoogleDriveService } from "~/resources/integrations/google-doc/googleDriveService"
import { createMock } from "@golevelup/ts-vitest"

vi.mock("~/resources/integrations/google-doc/googleDriveService" , () => ({
  GoogleDriveService: {
    getInstance: vi.fn(),
  },
}))

describe("<DriveAccessSummary />", () => {
  const mockDocs = [
    {
      id: "abc123",
      name: "Tournament Decks",
      modifiedTime: new Date("2023-11-15T12:00:00Z"),
    },
    {
      id: "def456",
      name: "Player List",
      modifiedTime: new Date("2023-11-14T08:30:00Z"),
    },
  ]
  const service = createMock<GoogleDriveService>()

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(GoogleDriveService.getInstance).mockReturnValue(service)
    service.listAllSpreadsheets.mockResolvedValue(mockDocs)
  })

  it("shows loading state initially", async () => {
    render(<DriveAccessSummary />)
    expect(await screen.findByText("…")).toBeInTheDocument()
  })

  it("displays number of documents after fetch", async () => {
    render(<DriveAccessSummary />)
    await waitFor(() => {
      expect(screen.getByText("2 shared Google Sheets")).toBeInTheDocument()
    })
  })

  it("opens modal with document list on button press", async () => {
    render(<DriveAccessSummary />)
    const button = await screen.findByText(/shared Google Sheets/)
    await userEvent.click(button)

    await screen.findByText("Google Sheets Access")
    expect(screen.getByText("Tournament Decks")).toBeInTheDocument()
    expect(screen.getByText("Player List")).toBeInTheDocument()
  })

  it("handles fetch failure gracefully", async () => {
    service.listAllSpreadsheets.mockRejectedValue(new Error("auth revoked"))

    render(<DriveAccessSummary />)
    await waitFor(() => {
      expect(screen.getByText("0 shared Google Sheets")).toBeInTheDocument()
    })
  })
})
