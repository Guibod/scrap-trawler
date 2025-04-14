import { render, screen } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { useMtgJson } from "~/resources/ui/providers/mtgjson"
import { useCards } from "~/resources/ui/providers/card"
import React from "react"
import CardDatabaseStatus from "~/resources/ui/components/card/status"
import { MemoryRouter } from "react-router-dom"

vi.mock("~/resources/ui/providers/mtgjson", () => ({
  useMtgJson: vi.fn(),
}))

vi.mock("~/resources/ui/providers/card", () => ({
  useCards: vi.fn(),
}))

describe("CardDatabaseStatus", () => {
  let mockMtgJson: {
    tableSize: number | null,
    localVersion: string | null,
    importProgress: number | null,
    isOutdated: boolean,
    importSize: number
  }
  let mockCards: {
    isIndexing: boolean,
    indexingProgress: number
  }

  beforeEach(() => {
    mockMtgJson = {
      tableSize: 1000,
      localVersion: "5.0.0",
      importProgress: null,
      isOutdated: false,
      importSize: 2000,
    }
    mockCards = {
      isIndexing: false,
      indexingProgress: 0,
    }

    vi.mocked(useMtgJson).mockReturnValue(mockMtgJson as unknown as ReturnType<typeof useMtgJson>)
    vi.mocked(useCards).mockReturnValue(mockCards as unknown as ReturnType<typeof useCards>)
  })

  it("renders importing state correctly", () => {
    mockMtgJson.importProgress = 500
    render(<CardDatabaseStatus />)

    expect(screen.getByText("Importing cards...")).toBeInTheDocument()
    expect(screen.getByLabelText("card-database-status-import-progress")).toBeInTheDocument()
  })

  it("renders indexing state correctly", () => {
    mockMtgJson.importProgress = null
    mockCards.isIndexing = true
    mockCards.indexingProgress = 300
    render(<CardDatabaseStatus />)

    expect(screen.getByText("Indexing cards...")).toBeInTheDocument()
    expect(screen.getByLabelText("card-database-status-indexing-progress")).toBeInTheDocument()
  })

  it("renders 'No card in database yet' when there is no local version", () => {
    mockMtgJson.localVersion = null
    render(
      <MemoryRouter>
        <CardDatabaseStatus />
      </MemoryRouter>
    )

    expect(screen.getByText("No card in database yet")).toBeInTheDocument()
  })

  it("renders the database status correctly when available", () => {
    render(
      <MemoryRouter>
        <CardDatabaseStatus />
      </MemoryRouter>
    )

    expect(screen.getByText("1000 cards • Version: 5.0.0")).toBeInTheDocument()
  })

  it("renders outdated version warning if applicable", () => {
    mockMtgJson.isOutdated = true
    render(
      <MemoryRouter>
        <CardDatabaseStatus />
      </MemoryRouter>)

    expect(screen.getByText("• New version available")).toBeInTheDocument()
  })
})
