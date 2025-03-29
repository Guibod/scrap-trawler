import { describe, it, expect, vi, beforeEach } from "vitest"
import { handleFileDownload } from "./download"

describe("handleFileDownload", () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURL = vi.fn(() => "blob://mock-url")
    revokeObjectURL = vi.fn()

    globalThis.URL.createObjectURL = createObjectURL
    globalThis.URL.revokeObjectURL = revokeObjectURL
  })

  it("creates and clicks a real anchor element", () => {
    const blob = new Blob(["hello world"], { type: "text/plain" })

    // Spy on <a> click
    const clickSpy = vi.fn()
    const anchor = document.createElement("a")
    anchor.click = clickSpy

    // Spy on document.createElement to return our custom <a>
    vi.spyOn(document, "createElement").mockReturnValue(anchor)

    handleFileDownload(blob, "test.txt")

    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob://mock-url")
    expect(anchor.download).toBe("test.txt")
    expect(anchor.href).toBe("blob://mock-url")
  })
})
