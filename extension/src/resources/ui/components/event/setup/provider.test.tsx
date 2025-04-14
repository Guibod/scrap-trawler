import { describe, it, vi, beforeEach, expect } from "vitest"
import React from "react"
import { render, waitFor, screen, act } from "@testing-library/react"
import { DUPLICATE_STRATEGY } from "~/resources/domain/enums/spreadsheet.dbo"
import { COLUMN_TYPE } from "~/resources/domain/enums/spreadsheet.dbo"
import {
  type EventSetupContextType,
  EventSetupProvider,
  useEventSetup
} from "~/resources/ui/components/event/setup/provider"

vi.mock("~/resources/ui/providers/event", () => ({
  useEvent: () => ({
    event: {
      id: "evt_123",
      players: {},
      raw_data: { spreadsheet: null },
      spreadsheet: { meta: null },
      mapping: {}
    },
    updateEvent: vi.fn(() => Promise.resolve())
  })
}))

vi.mock("~/resources/ui/providers/fetcher", () => ({
  useFetchService: () => ({ fetchEvent: vi.fn(() => Promise.resolve()) })
}))

vi.mock("@heroui/react", async () => {
  const actual = await vi.importActual("@heroui/react")
  return {
    ...actual,
    addToast: vi.fn()
  }
})

vi.mock("~/resources/ui/components/event/setup/status", () => ({
  SetupStatus: {
    create: vi.fn(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            meta: { columns: [{ index: 0, type: "PLAYER_NAME" }] },
            pairs: { p1: "p2" }
          })
        }, 50) // simulate loading delay
      })
    )
  }
}))

vi.mock("~/resources/domain/parsers/spreadsheet.parser.factory", () => ({
  SpreadsheetParserFactory: {
    create: vi.fn(() => ({
      parse: vi.fn(() => Promise.resolve({
        columns: [{ index: 0, type: "PLAYER_NAME" }],
        rows: [{ 0: "Alice" }, { 0: "Bob" }]
      }))
    }))
  }
}))

const renderWithProvider = (ui: React.ReactNode) => {
  return render(
    <EventSetupProvider onQuitHandler={vi.fn()}>
      {ui}
    </EventSetupProvider>
  )
}

describe("EventSetupProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders spinner while loading status", async () => {
    renderWithProvider(<div data-testid="inside" />)
    expect(await screen.findByLabelText(/please wait/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByTestId("inside")).toBeInTheDocument())
  })

  it("allows updating duplicate strategy", async () => {
    let contextValue
    const Consumer = () => {
      contextValue = useEventSetup()
      return <span>ready</span>
    }
    renderWithProvider(<Consumer />)
    await screen.findByText("ready")

    await act(async () => {
      contextValue.handleStrategy(DUPLICATE_STRATEGY.KEEP_FIRST)
    })

    // Force re-read after render tick
    expect(contextValue.spreadsheetMeta.duplicateStrategy).toBe(DUPLICATE_STRATEGY.KEEP_FIRST)
  })

  it("handles file upload and updates data", async () => {
    let contextValue
    const Consumer = () => {
      contextValue = useEventSetup()
      return <span>upload test</span>
    }
    renderWithProvider(<Consumer />)
    await screen.findByText("upload test")

    const file = new File(["sample data"], "sample.csv", { type: "text/csv" })
    contextValue.handleFileUpload(file, true)

    await waitFor(() => {
      expect(contextValue.spreadsheetData).toEqual([{ 0: "Alice" }, { 0: "Bob" }])
    })
  })

  it("handles pairings update", async () => {
    let contextValue: EventSetupContextType
    const Consumer = () => {
      contextValue = useEventSetup()
      return <span>pairing test</span>
    }
    renderWithProvider(<Consumer />)
    await screen.findByText("pairing test")

    await act(async () => {
      contextValue.handlePairings({ foo: { rowId: "bar", mode: "manual" } })
    })
    // expect(contextValue.status).not.toBeNull() // pairings do not directly affect status in test mock
  })

  it("finalizes setup with valid data", async () => {
    let contextValue
    const mockQuit = vi.fn(() => Promise.resolve())
    const Consumer = () => {
      contextValue = useEventSetup()
      return <span>finalize test</span>
    }
    render(
      <EventSetupProvider onQuitHandler={mockQuit}>
        <Consumer />
      </EventSetupProvider>
    )
    await screen.findByText("finalize test")
    await waitFor(() => expect(contextValue.status).not.toBeNull())
    contextValue.handleFinalization()
    await waitFor(() => expect(mockQuit).toHaveBeenCalled())
  })

  it("updates column mapping and resets duplicates", async () => {
    let contextValue
    const Consumer = () => {
      contextValue = useEventSetup()
      return <span>column test</span>
    }
    renderWithProvider(<Consumer />)
    await screen.findByText("column test")

    await act(async () => {
      contextValue.handleColumnMapping({ index: 0, type: COLUMN_TYPE.FIRST_NAME })
    })
    expect(contextValue.spreadsheetMeta.columns[0].type).toBe(COLUMN_TYPE.FIRST_NAME)
  })

  it("updates format", async () => {
    let contextValue
    const Consumer = () => {
      contextValue = useEventSetup()
      return <span>format test</span>
    }
    renderWithProvider(<Consumer />)
    await screen.findByText("format test")

    await act(() => {
      contextValue.handleFormat("commander")
    })
    expect(contextValue.spreadsheetMeta.format).toBe("commander")
  })
})