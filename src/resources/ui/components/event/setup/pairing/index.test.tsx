import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import SetupPairing from "./index"
import React from "react"

vi.mock("~/resources/ui/components/event/setup/provider", () => ({
  useEventSetup: () => ({
    status: {
      data: [],
      pairs: {},
      hasAllPairings: false
    },
    event: { mapping: {}, players: {} },
    handlePairings: vi.fn()
  })
}))

vi.mock("~/resources/ui/components/event/setup/pairing/usePairing.controller", () => ({
  usePairingController: () => ({
    handleDragEnd: vi.fn(),
    handleDragStart: vi.fn(),
    matchByName: vi.fn(),
    assignRandomly: vi.fn(),
    unassignAll: vi.fn(),
    localMapping: {},
    unassigned: [],
    getSortedPlayers: () => [],
    active: null
  })
}))

vi.mock("~/resources/ui/components/event/setup/pairing/main", () => ({
  __esModule: true,
  default: () => <div>MainColumn</div>
}))

vi.mock("~/resources/ui/components/event/setup/pairing/sidebar", () => ({
  __esModule: true,
  default: () => <div>Sidebar</div>
}))

vi.mock("~/resources/ui/components/event/setup/pairing/actions", () => ({
  __esModule: true,
  default: () => <div>ActionBar</div>
}))

describe("SetupPairing", () => {
  it("renders all core layout areas", () => {
    render(<SetupPairing />)
    expect(screen.getByText("MainColumn")).toBeInTheDocument()
    expect(screen.getByText("Sidebar")).toBeInTheDocument()
    expect(screen.getByText("ActionBar")).toBeInTheDocument()
  })
})