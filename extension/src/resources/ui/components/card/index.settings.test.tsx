import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import React from "react"
import { vi, describe, beforeEach, it, expect, type Mock } from "vitest"
import { useCards } from "~/resources/ui/providers/card"
import { useSettings } from "~/resources/ui/providers/settings"
import { CardLanguage } from "~/resources/storage/entities/card.entity"
import CardIndexSettings from "~/resources/ui/components/card/index.settings"

vi.mock("~/resources/ui/providers/card", () => ({
  useCards: vi.fn(),
}))

vi.mock("~/resources/ui/providers/settings", () => ({
  useSettings: vi.fn(),
}))

describe("CardIndexSettings", () => {
  let mockSettings: { settings: { searchLanguages: CardLanguage[] }, setOne: Mock, setMany: Mock }
  let mockCards: {
    indexingProgress: number,
    indexingSize: number,
    indexSize: number,
    buildIndex: Mock
  }

  beforeEach(() => {
    mockSettings = {
      settings: { searchLanguages: [CardLanguage.ENGLISH] },
      setOne: vi.fn().mockResolvedValue(undefined),
      setMany: vi.fn()
    }
    mockCards = {
      indexingProgress: 0,
      indexingSize: 1000,
      indexSize: 500,
      buildIndex: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(useSettings).mockReturnValue(mockSettings as unknown as ReturnType<typeof useSettings>)
    vi.mocked(useCards).mockReturnValue(mockCards as unknown as ReturnType<typeof useCards>)
  })

  it("renders the component with correct initial values", () => {
    render(<CardIndexSettings />)
    expect(screen.getByText("Card Index")).toBeInTheDocument()
    expect(screen.getByText("(500 cards)")).toBeInTheDocument()
    expect(screen.getByLabelText("Select indexation languages")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Update Index/i })).toBeInTheDocument()
  })

  it("updates selected languages when changed", async () => {
    render(<CardIndexSettings />)

    const spanishCheckbox = screen.getByLabelText("Spanish")
    fireEvent.click(spanishCheckbox)

    await waitFor(() => {
      expect(mockSettings.setOne).toHaveBeenCalledWith("searchLanguages", [CardLanguage.ENGLISH, CardLanguage.SPANISH])
    })
  })

  it("disables the button when indexing is in progress", () => {
    mockCards.indexingProgress = 1
    render(<CardIndexSettings />)

    expect(screen.getByRole("button", { name: /Update Index/i })).toBeDisabled()
  })

  it("triggers buildIndex when clicking the Update Index button", async () => {
    render(<CardIndexSettings />)

    const button = screen.getByRole("button", { name: /Update Index/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCards.buildIndex).toHaveBeenCalled()
    })
  })
})
