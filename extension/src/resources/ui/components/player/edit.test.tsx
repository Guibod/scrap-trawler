import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { vi, expect, beforeEach, it } from "vitest"
import { EventContextType, useEvent } from "~/resources/ui/providers/event"
import PlayerEdit from "~/resources/ui/components/player/edit"
import type { PlayerDbo } from "~/resources/domain/dbos/player.dbo"
import type { EventModel } from "~/resources/domain/models/event.model"

vi.mock("~/resources/ui/providers/event")

const mockUpdate = vi.fn()
const fakePlayer = {
  firstName: "John",
  lastName: "Doe",
  displayName: "JD123",
  archetype: "Burn",
  overrides: {
    firstName: "Johnny",
    lastName: "Doe",
    displayName: "JD",
    archetype: "Prowess",
    decklistUrl: "http://decklist.com",
    decklistTxt: "1 Mountain\n1 Bolt",
  },
}

beforeEach(() => {
  vi.mocked(useEvent).mockReturnValue({
    event: { players: { "p1": fakePlayer as PlayerDbo} } as unknown as EventModel,
    updatePlayerOverride: mockUpdate,
  } as unknown as EventContextType)
})

it("opens modal and edits player", async () => {
  render(<PlayerEdit playerId="p1" />)

  fireEvent.click(screen.getByRole("button", { name: /edit/i }))

  // Wait for modal input to appear
  await screen.findByLabelText(/First Name/i)

  fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Jon" } })
  fireEvent.change(screen.getByLabelText(/Decklist URL/i), { target: { value: "http://new.com" } })
  fireEvent.click(screen.getByRole("button", { name: /save/i }))

  expect(mockUpdate).toHaveBeenCalledWith("p1", expect.objectContaining({
    firstName: "Jon",
    decklistUrl: "http://new.com",
  }))
})