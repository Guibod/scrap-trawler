import { describe, it, expect } from "vitest"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"
import { countDiff } from "~/resources/utils/diff"

describe("countDiff", () => {
  it("returns 0 when mappings are equal", () => {
    const a: MappingDbo = {
      player1: { rowId: "row1", mode: "manual" }
    }
    const b: MappingDbo = {
      player1: { rowId: "row1", mode: "manual" }
    }

    expect(countDiff(a, b)).toBe(0)
  })

  it("counts missing entries", () => {
    const a: MappingDbo = {
      player1: { rowId: "row1", mode: "manual" }
    }
    const b: MappingDbo = {}

    expect(countDiff(a, b)).toBe(1)
  })

  it("counts differing rowId or mode", () => {
    const a: MappingDbo = {
      player1: { rowId: "row1", mode: "manual" }
    }
    const b: MappingDbo = {
      player1: { rowId: "row2", mode: "manual" }
    }

    expect(countDiff(a, b)).toBe(1)

    const c: MappingDbo = {
      player1: { rowId: "row1", mode: "random" }
    }

    expect(countDiff(a, c)).toBe(1)
  })

  it("counts multiple differences", () => {
    const a: MappingDbo = {
      player1: { rowId: "row1", mode: "manual" },
      player2: { rowId: "row2", mode: "manual" }
    }

    const b: MappingDbo = {
      player1: { rowId: "row1", mode: "manual" },
      player2: { rowId: "row3", mode: "random" }
    }

    expect(countDiff(a, b)).toBe(1)
  })
})
