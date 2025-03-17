import { describe, it, expect, beforeEach, vi } from "vitest"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import EventRegistration from "~/resources/ui/components/registration/registration"
import { useEvent } from "~/resources/ui/providers/event"

// Mock `useEvent` to provide test data
vi.mock("~/resources/ui/providers/event", () => ({
  useEvent: vi.fn()
}))

// Mock PlayerName component
vi.mock("~/resources/ui/components/player/name", () => ({
  default: ({ player }: { player: any }) => <span data-testid="player-name">{player.name}</span>
}))

describe("EventRegistration", () => {
  const mockEvent = {
    players: {
      "1": { id: "1", teamId: "Team A", name: "Alice", displayName: "Alice", archetype: "Control", tableNumber: 5 },
      "2": { id: "2", teamId: "Team B", name: "Bob", displayName: "Bob", archetype: "Aggro", tableNumber: 10 }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders table headers correctly", () => {
    vi.mocked(useEvent).mockReturnValue({ event: mockEvent } as unknown as ReturnType<typeof useEvent>)

    render(<EventRegistration />)

    expect(screen.getByText("Team Id")).toBeInTheDocument()
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Display Name")).toBeInTheDocument()
    expect(screen.getByText("Archetype")).toBeInTheDocument()
    expect(screen.getByText("Unique Identifier")).toBeInTheDocument()
    expect(screen.getByText("Table")).toBeInTheDocument()
  })

  it("displays player data correctly", async () => {
    vi.mocked(useEvent).mockReturnValue({ event: mockEvent } as unknown as ReturnType<typeof useEvent>)

    render(<EventRegistration />)

    await waitFor(() => {
      expect(screen.getByText("Team A")).toBeInTheDocument()
      expect(screen.getAllByTestId("player-name")[0]).toHaveTextContent("Alice")
      expect(screen.getByText("Control")).toBeInTheDocument()
      expect(screen.getByText("5")).toBeInTheDocument()

      expect(screen.getByText("Team B")).toBeInTheDocument()
      expect(screen.getAllByTestId("player-name")[1]).toHaveTextContent("Bob")
      expect(screen.getByText("Aggro")).toBeInTheDocument()
      expect(screen.getByText("10")).toBeInTheDocument()
    })
  })

  it("shows empty state when no players are available", () => {
    vi.mocked(useEvent).mockReturnValue({ event: { players: {} } } as unknown as ReturnType<typeof useEvent>)

    render(<EventRegistration />)

    expect(screen.getByText("No matches yet, use scrape button on EventLink.com page to add events.")).toBeInTheDocument()
  })
})
