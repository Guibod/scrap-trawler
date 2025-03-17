import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getInlineAnchorList, render, createShadowRoot, getStyle } from "~/contents/eventlink-content"
import { createRoot } from "react-dom/client"
import type { PlasmoCSUIAnchor } from "plasmo"

vi.mock("plasmo", () => ({
  PlasmoCreateShadowRoot: vi.fn(),
  PlasmoCSConfig: vi.fn(),
  PlasmoGetInlineAnchorList: vi.fn(),
  PlasmoGetStyle: vi.fn(),
  PlasmoRender: vi.fn()
}))

// Mock dependencies
const mockRender = vi.fn()
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: mockRender
  }))
}))

vi.mock("~/resources/ui/containers/event-calendar-action", () => ({
  default: vi.fn(() => "EventCalendarActionComponent")
}))

vi.mock("~/resources/ui/containers/event-title-actions", () => ({
  default: vi.fn(() => "EventTitleActionsComponent")
}))

vi.mock("@heroui/react", () => ({
  HeroUIProvider: vi.fn(({ children }) => children)
}))

describe("eventlink-content.tsx", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="event-page-header__primary"></div>
      <div class="event-card"></div>
    `
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should find inline anchors for event headers and event cards", async () => {
    const anchors = await getInlineAnchorList()

    expect(anchors).toHaveLength(2) // One header + One event-card

    expect((anchors[0] as PlasmoCSUIAnchor).element).toHaveClass("event-page-header__primary")
    expect((anchors[1] as PlasmoCSUIAnchor).element).toHaveClass("event-card")
  })

  it("should render EventTitleActions for event headers", async () => {
    const anchor = {
      element: document.querySelector(".event-page-header__primary"),
      type: "inline"
    }  as PlasmoCSUIAnchor
    const createRootContainer = vi.fn().mockResolvedValue(document.createElement("div"))

    await render({ anchor, createRootContainer }, vi.fn())

    expect(createRoot).toHaveBeenCalled()
    expect(mockRender).toHaveBeenCalled()
  })

  it("should render EventCalendarAction for event cards with correct container", async () => {
    const anchor = {
      element: document.querySelector(".event-card"),
      type: "inline"
    } as PlasmoCSUIAnchor

    const createRootContainer = vi.fn().mockResolvedValue(document.createElement("div"))

    await render({ anchor, createRootContainer }, vi.fn())

    expect(createRoot).toHaveBeenCalled()
    expect(mockRender).toHaveBeenCalled()
  })

  it("should create a shadow root with correct styles", () => {
    const shadowHost = document.createElement("div")
    const shadowRoot = createShadowRoot(shadowHost)

    expect(shadowRoot).toBeInstanceOf(ShadowRoot)
    expect(shadowHost.style.position).toBe("relative")
    expect(shadowHost.style.gridArea).toBe("1 / 1")
  })

  it("should return a style element with CSS text", async () => {
    const style = await getStyle()
    expect(style).toBeInstanceOf(HTMLStyleElement)
    expect(style.textContent).toBeTruthy()
  })
})
