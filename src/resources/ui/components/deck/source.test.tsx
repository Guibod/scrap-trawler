import { describe, expect, it, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"
import { DeckSourceBadge } from "~/resources/ui/components/deck/source"
import { type DeckContextValue, useDeck } from "~/resources/ui/components/deck/provider"
import type { ResolvedDeckDbo } from "~/resources/domain/mappers/deck.mapper"
import { MemoryRouter } from "react-router-dom"

vi.mock("~/resources/ui/components/deck/provider", () => ({
  useDeck: vi.fn()
}))

describe("DeckSourceBadge", () => {
  const baseDeck = {
    id: "deck1",
    url: undefined,
    spreadsheetRowId: "row-123",
    lastUpdated: null,
    boards: { main: [], side: [] },
    archetype: null,
    face: null,
    status: "OK",
    legal: true,
    format: "commander",
    colors: [],
  } as unknown as ResolvedDeckDbo

  it("renders Moxfield deck correctly", () => {
    vi.mocked(useDeck).mockReturnValue({ deck: { ...baseDeck, source: DeckSource.MOXFIELD } } as DeckContextValue)
    render(<MemoryRouter><DeckSourceBadge /></MemoryRouter>)
    expect(screen.getByText("Moxfield")).toBeInTheDocument()
    expect(screen.getByLabelText("link-icon")).toHaveClass("flex-shrink-0 w-5 h-5") // LinkIcon
  })

  it("renders Text Import deck correctly", () => {
    vi.mocked(useDeck).mockReturnValue({ deck: { ...baseDeck, source: DeckSource.TEXT } }as DeckContextValue)
    render(<MemoryRouter><DeckSourceBadge /></MemoryRouter>)
    expect(screen.getByText("Text Import")).toBeInTheDocument()
  })

  it("renders Unknown deck as fallback", () => {
    vi.mocked(useDeck).mockReturnValue({ deck: { ...baseDeck, source: "InvalidSource" as DeckSource }}as DeckContextValue)
    render(<MemoryRouter><DeckSourceBadge /></MemoryRouter>)
    expect(screen.getByText("Unknown")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    vi.mocked(useDeck).mockReturnValue({ deck: { ...baseDeck, source: DeckSource.TEXT }} as DeckContextValue)
    render(<MemoryRouter><DeckSourceBadge className="custom-style" /></MemoryRouter>)
    expect(screen.getByText("Text Import").parentElement).toHaveClass("custom-style")
  })
})
