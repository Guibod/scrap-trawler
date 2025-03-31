import { render, screen, fireEvent, within } from "@testing-library/react"
import { vi, describe, it, expect } from "vitest"
import React from "react"
import PlayerSelector from "~/resources/ui/components/player/selector"
import userEvent from "@testing-library/user-event"
import type { PlayerProfile } from "~/resources/domain/mappers/player.mapper"
import { PlayerStatusDbo } from "~/resources/domain/enums/player.status.dbo"

// Mock usePlayers
vi.mock("~/resources/ui/providers/event", () => ({
  useEvent: vi.fn().mockImplementation(() => ({

  })),
  usePlayer: vi.fn().mockImplementation((id: string): PlayerProfile => ({
    id,
    avatar: "https://example.com/avatar.jpg",
    isAnonymized: false,
    isOverride: false,
    archetype: "Boros Burn",
    tournamentId: "123",
    teamId: "",
    displayName: `Display ${id}`,
    firstName: `Firstname ${id}`,
    lastName: `Lastname ${id}`,
    status: PlayerStatusDbo.IDENTIFIED,
    tableNumber: 0,
    mapMode: "manual",
    deck: undefined,
    matches: [],
    extra: undefined,
    spreadsheetRowId: "row-123",
    decklistTxt: "foo",
    decklistUrl: "https://example.com",
  })),
  usePlayers: () => ({
    alice: { id: "alice", displayName: "Alice" },
    bob: { id: "bob", firstname: "Bob", lastname: "Smith" }
  })
}))

describe("PlayerSelector", () => {
  const user = userEvent.setup()

  it("renders all players as options when opened", async () => {
    render(<PlayerSelector value="alice" onChange={() => {}} />)

    // Find the actual button (acts as the trigger)
    const trigger = screen.getByRole("button")

    // Open the dropdown
    await user.click(trigger)

    // Now get the options by role — they're dynamically rendered
    const options = await screen.findAllByRole("option")

    expect(options.length).toBe(2)

    const textContent = options.map((opt) => opt.textContent?.toLowerCase())
    expect(textContent).toEqual(expect.arrayContaining([
      expect.stringContaining("alice"),
      expect.stringContaining("bob")
    ]))
  })

  it("calls onChange when a player is selected", async () => {
    const handleChange = vi.fn()

    render(<PlayerSelector value="alice" onChange={handleChange} />)

    // Open the select dropdown
    const trigger = screen.getByRole("button")
    await user.click(trigger)

    // Select the second option (bob)
    const options = await screen.findAllByRole("option")
    await user.click(options[1]) // this assumes alice is first, bob second

    expect(handleChange).toHaveBeenCalledWith("bob")
  })
})
