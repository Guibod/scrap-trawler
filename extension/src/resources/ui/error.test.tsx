// error.test.tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import { ErrorBoundary } from "~/resources/ui/error"

const Bomb = () => {
  throw new Error("💣 Boom")
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Safe Child</div>
      </ErrorBoundary>
    )
    expect(screen.getByText("Safe Child")).toBeInTheDocument()
  })

  it("catches errors and renders fallback UI", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )

    expect(screen.getByRole("img")).toHaveAttribute("alt", "Something broke")
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument()
    expect(screen.getByText(/Try reloading/i)).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })
})
