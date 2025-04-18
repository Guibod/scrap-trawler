import { render, screen } from "@testing-library/react"
import React from "react"
import userEvent from "@testing-library/user-event"
import GooglePicker from "./picker"
import { vi, expect, beforeEach, describe } from "vitest"

describe("<GooglePicker />", () => {
  const mockUrl = "https://drive.google.com/file/d/123/view"

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the iframe with correct picker URL", () => {
    render(<GooglePicker onPick={() => {}} />)
    const iframe = screen.getByTitle("Google Drive Picker") as HTMLIFrameElement
    expect(iframe).toBeInTheDocument()
    expect(iframe.src).toContain("https://scraptrawler.app/google.drive.picker")
  })

  it("sends showPicker message when iframe loads", () => {
    const postMessageMock = vi.fn()
    render(<GooglePicker onPick={() => {}} />)
    const iframe = screen.getByTitle("Google Drive Picker") as HTMLIFrameElement

    Object.defineProperty(iframe, "contentWindow", {
      value: { postMessage: postMessageMock },
      writable: true,
    })

    iframe.dispatchEvent(new Event("load"))
    expect(postMessageMock).toHaveBeenCalledWith({ m: "showPicker" }, "*")
  })

  it("invokes onPick with the picked URL from message event", () => {
    const onPick = vi.fn()
    render(<GooglePicker onPick={onPick} />)

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { m: "pickerResult", url: mockUrl },
      })
    )

    expect(onPick).toHaveBeenCalledWith(mockUrl)
  })

  it("does not call onPick for null or empty url", () => {
    const onPick = vi.fn()
    render(<GooglePicker onPick={onPick} />)

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { m: "pickerResult", url: null },
      })
    )

    expect(onPick).not.toHaveBeenCalled()
  })

  it("can be closed via the Close button", async () => {
    render(<GooglePicker onPick={() => {}} />)
    const [_, footerCloseButton] = screen.getAllByRole("button", { name: /close/i })
    await userEvent.click(footerCloseButton)
    // Since HeroUI manages the modal state internally, you might check that the modal is hidden or button is removed
    await new Promise((r) => setTimeout(r, 10)) // wait for state update
    expect(footerCloseButton).not.toBeVisible() // or check modal state if available
  })
})
