// __tests__/ColorIdentity.test.tsx
import { render, screen } from "@testing-library/react"
import { vi, it, expect, beforeEach, describe } from "vitest"
import * as colorEnums from "~/resources/domain/enums/mtg/colors.dbo"
import React from "react"
import ColorIdentity from "~/resources/ui/components/mana/identity"

vi.mock("~/resources/ui/components/mana/W", () => ({ default: ({ size }: any) => <div>W-{size}</div> }))
vi.mock("~/resources/ui/components/mana/U", () => ({ default: ({ size }: any) => <div>U-{size}</div> }))
vi.mock("~/resources/ui/components/mana/B", () => ({ default: ({ size }: any) => <div>B-{size}</div> }))
vi.mock("~/resources/ui/components/mana/R", () => ({ default: ({ size }: any) => <div>R-{size}</div> }))
vi.mock("~/resources/ui/components/mana/G", () => ({ default: ({ size }: any) => <div>G-{size}</div> }))
vi.mock("~/resources/ui/components/mana/C", () => ({ default: ({ size }: any) => <div>C-{size}</div> }))
vi.mock("@heroui/tooltip", () => ({ Tooltip: ({ children }: any) => <div>{children}</div> }))

describe("ColorIdentity", () => {
  beforeEach(() => {
    vi.spyOn(colorEnums, "humanReadable").mockImplementation((colors) => `Readable: ${colors.join(",")}`)
  })

  it("renders all specified colors", () => {
    render(<ColorIdentity identity={[
      colorEnums.MTG_COLORS.WHITE,
      colorEnums.MTG_COLORS.BLUE,
      colorEnums.MTG_COLORS.BLACK,
      colorEnums.MTG_COLORS.RED,
      colorEnums.MTG_COLORS.GREEN
    ]} size="sm" />)

    expect(screen.getByText("W-sm")).toBeInTheDocument()
    expect(screen.getByText("U-sm")).toBeInTheDocument()
    expect(screen.getByText("B-sm")).toBeInTheDocument()
    expect(screen.getByText("R-sm")).toBeInTheDocument()
    expect(screen.getByText("G-sm")).toBeInTheDocument()
  })

  it("renders colorless when identity is empty", () => {
    render(<ColorIdentity identity={[]} size="md" />)
    expect(screen.getByText("C-md")).toBeInTheDocument()
  })

  it("renders nothing when identity is undefined", () => {
    const { container } = render(<ColorIdentity identity={undefined as any} size="md" />)
    expect(container.firstChild).toBeNull()
  })
})
