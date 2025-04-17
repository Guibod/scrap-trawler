import { vi, describe, expect, beforeEach, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SetupUpload from "~/resources/ui/components/event/setup/upload";
import React from "react";
import { type EventSetupContextType, useEventSetup } from "~/resources/ui/components/event/setup/provider"
import userEvent from "@testing-library/user-event"

vi.mock("~/resources/ui/components/event/setup/provider", () => ({
  useEventSetup: vi.fn(),
}))

// Mock the spreadsheet import form (only check its presence)
vi.mock("~/resources/ui/components/event/setup/import", () => ({
  SpreadsheetImportForm: () => <div data-testid="SpreadsheetImportForm" />
}))

describe("SetupUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useEventSetup).mockReturnValue({
      event: {
        format: null,
        spreadsheet: { meta: { source: "" } }
      },
      status: { hasData: false },
      handleFormat: vi.fn(),
    } as unknown as EventSetupContextType)
  })

  it("renders the event setup guide and import form", () => {
    render(<SetupUpload />)

    expect(screen.getByText("Event Setup Guide")).toBeInTheDocument()
    expect(screen.getByTestId("SpreadsheetImportForm")).toBeInTheDocument()
  })

  it("shows success alert if status.hasData is true", () => {
    vi.mocked(useEventSetup).mockReturnValue({
      event: {
        format: null,
        spreadsheet: { meta: { source: "" } }
      },
      status: { hasData: true },
      handleFormat: vi.fn(),
    } as unknown as EventSetupContextType)

    render(<SetupUpload />)
    expect(screen.getByText("The spreadsheet was recovered successfully")).toBeInTheDocument()
  })
})
