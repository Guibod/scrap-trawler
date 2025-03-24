import { render, screen } from "@testing-library/react"
import React from "react"
import { vi, it, expect, describe, beforeEach } from "vitest"
import Duplicates from "~/resources/ui/components/event/setup/duplicates"
import * as setupProvider from "~/resources/ui/components/event/setup/provider"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe("Duplicates", () => {
  const baseRow: SpreadsheetRow = {
    id: "1",
    firstName: "Alice",
    lastName: "Smith",
    archetype: "Jeskai",
    decklistUrl: "https://a.com",
    decklistTxt: "4 Island",
    player: { foo: "bar"}
  }

  beforeEach(() => {
    vi.spyOn(setupProvider, "useEventSetup").mockReturnValue({
      status: {
        duplicates: {
          "player@example.com": [
            {...baseRow},
            {...baseRow},
          ],
          "deck-diff@example.com": [
            {...baseRow},
            {...baseRow, decklistTxt: "5 Island" },
          ],
          "name-mismatch@example.com": [
            {...baseRow},
            {...baseRow, firstName: "Bob" },
          ],
          "other-diff@example.com": [
            {...baseRow},
            {...baseRow, archetype: "Izzet" },
          ],
        }
      }
    } as unknown as ReturnType<typeof setupProvider.useEventSetup>)

    render(<Duplicates />)
  })

  it("renders identical rows with ✅ summary", () => {
    expect(screen.getByText("✅ All rows are identical")).toBeInTheDocument()
  })

  it("renders decklist difference with ⚠️ summary", () => {
    expect(screen.getByText(/⚠️ Decklist differs/)).toBeInTheDocument()
  })

  it("renders name column difference with ❌ summary", () => {
    expect(screen.getByText(/Name columns are not identical/)).toBeInTheDocument()
  })

  it("renders general difference with ❌ summary", () => {
    expect(screen.getByText(/Many items differs/)).toBeInTheDocument()
  })

  it("renders all duplicate tables", async () => {
    const user = userEvent.setup()
    const item = screen.getByLabelText("other-diff@example.com")

    // Click to expand
    await user.click(within(item).getByRole("button"))

    expect(within(item).getAllByRole("row")).toHaveLength(3) // header + 2 rows
    expect(within(item).getAllByText("Alice")).toHaveLength(2)
  })
})
