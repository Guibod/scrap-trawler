import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PairingActions from "./actions"
import React from "react"

describe("PairingActions", () => {
  it("calls callbacks on button click", async () => {
    const user = userEvent.setup()
    const matchByName = vi.fn()
    const assignRandomly = vi.fn()
    const unassignAll = vi.fn()

    render(
      <PairingActions
        matchByName={matchByName}
        assignRandomly={assignRandomly}
        unassignAll={unassignAll}
      />
    )

    await user.click(screen.getByRole("button", { name: /match by name/i }))
    expect(matchByName).toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: /assign randomly/i }))
    expect(assignRandomly).toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: /reset assignments/i }))
    expect(unassignAll).toHaveBeenCalled()
  })
})