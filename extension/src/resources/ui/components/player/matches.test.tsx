import React from "react"
import { render, screen } from "@testing-library/react"
import { vi, expect, it, beforeEach } from "vitest"
import { useEvent, usePlayer, usePlayers } from "~/resources/ui/providers/event"
import { MemoryRouter } from "react-router-dom"
import { PlayerMatches } from "~/resources/ui/components/player/matches"

vi.mock("~/resources/ui/providers/event")

beforeEach(() => {
  vi.mocked(useEvent).mockReturnValue({ event: { id: "event-1" } } as unknown as ReturnType<typeof useEvent>)
  vi.mocked(usePlayers).mockReturnValue({
    p2: { firstName: "John", lastName: "Doe", avatar: "/avatar.png" },
    p3: { firstName: "Jane", lastName: "Doe", avatar: "/snap.png" },
  } as unknown as ReturnType<typeof usePlayers>)
  vi.mocked(usePlayer).mockReturnValue({
    matches: [
      {
        matchId: "m1",
        round: 1,
        opponentPlayerIds: ["p2"],
        result: { wins: 2, losses: 1, draws: 0, isBye: false },
        tableNumber: 12,
        opponentTeamId: "team-1",
      },
      {
        matchId: "m2",
        round: 2,
        opponentPlayerIds: ["p3"],
        result: { wins: 1, losses: 1, draws: 1, isBye: false },
        tableNumber: 13,
        opponentTeamId: "team-2",
      },
    ]
  } as unknown as ReturnType<typeof usePlayer>)
})

it("renders player matches with scores and opponent info", () => {
  render(
    <MemoryRouter>
      <PlayerMatches />
    </MemoryRouter>
  )

  expect(screen.getByText("Round #1")).toBeInTheDocument()
  expect(screen.getByText("2-1-0")).toBeInTheDocument()
  expect(screen.getByText("John Doe")).toBeInTheDocument()
  expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/event/event-1/player/p2")

  expect(screen.getByText("Round #2")).toBeInTheDocument()
  expect(screen.getByText("1-1-1")).toBeInTheDocument()
  expect(screen.getByText("Jane Doe")).toBeInTheDocument()
  expect(screen.getAllByRole("link")[1]).toHaveAttribute("href", "/event/event-1/player/p3")
})
