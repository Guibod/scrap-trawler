import { describe, it, expect, beforeEach, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import EventView from "~/resources/ui/components/event/view"
import { useEvent } from "~/resources/ui/providers/event"
import userEvent from "@testing-library/user-event"

// Mock `useEvent` to provide test data
vi.mock("~/resources/ui/providers/event", () => ({
  useEvent: vi.fn()
}))

// Mock Components
vi.mock("~/resources/ui/components/round/pairings", () => ({
  default: vi.fn(() => <div data-testid="round-pairings">RoundPairings</div>)
}))

vi.mock("~/resources/ui/components/round/standings", () => ({
  default: vi.fn(() => <div data-testid="round-standings">RoundStandings</div>)
}))

vi.mock("~/resources/ui/components/registration/registration", () => ({
  default: vi.fn(() => <div data-testid="event-registration">EventRegistration</div>)
}))

describe("EventView", () => {
  const mockEvent = {
    lastRound: 2,
    rounds: {
      1: { roundNumber: 1 },
      2: { roundNumber: 2 },
      3: { roundNumber: 3 }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useEvent).mockReturnValue({ event: mockEvent } as unknown as ReturnType<typeof useEvent>)
  })

  it("renders correctly", () => {
    render(<EventView />)

    expect(screen.getByText("🔢 Round Pairings")).toBeInTheDocument()
    expect(screen.getByText("📊 Standings")).toBeInTheDocument()
    expect(screen.getByText("👤 Registration")).toBeInTheDocument()
  })

  it("displays the correct default round in Select", () => {
    render(<EventView />)

    expect(screen.getByLabelText("event-round-selector")).toHaveTextContent("Round #2") // Last round
  })

  it("changes the displayed round when a new round is selected", async () => {
    render(<EventView />)

    // 1️⃣ Find and click the dropdown trigger
    const selectTrigger = screen.getByLabelText("event-round-selector")
    await userEvent.click(selectTrigger)

    // 2️⃣ Find the correct "Round #1" option using data-label="true"
    const roundOption = await screen.findByText(
      (content, element) => element?.getAttribute("data-label") === "true" && content === "Round #1"
    )

    // 3️⃣ Click to select "Round #1"
    await userEvent.click(roundOption)

    // 4️⃣ Verify that the selected value updates
    expect(selectTrigger).toHaveTextContent("Round #1")
  })



  it("renders the correct tab content when switching tabs", async () => {
    render(<EventView />)

    expect(screen.getByTestId("round-pairings")).toBeInTheDocument()

    await userEvent.click(screen.getByText("📊 Standings"))
    expect(screen.getByTestId("round-standings")).toBeInTheDocument()

    await userEvent.click(screen.getByText("👤 Registration"))
    expect(screen.getByTestId("event-registration")).toBeInTheDocument()
  })
})
