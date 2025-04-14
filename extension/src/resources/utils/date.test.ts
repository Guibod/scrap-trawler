import { describe, it, expect } from "vitest"
import { formatTimeDifference } from "~/resources/utils/date"

describe("formatTimeDifference", () => {
  const now = new Date("2025-04-06T12:00:00Z")

  it("shows less than 1 precision when zero", () => {
    expect(formatTimeDifference(now, now, "second")).toBe("less than 1 second")
  })

  it("formats past seconds", () => {
    const past = new Date(now.getTime() - 15_000)
    expect(formatTimeDifference(past, now, "second")).toBe("15 seconds later")
  })

  it("formats past minutes", () => {
    const past = new Date(now.getTime() - 3 * 60_000)
    expect(formatTimeDifference(past, now, "minute")).toBe("3 minutes later")
  })

  it("formats past hours", () => {
    const past = new Date(now.getTime() - 2 * 60 * 60_000)
    expect(formatTimeDifference(past, now, "hour")).toBe("2 hours later")
  })

  it("formats past days", () => {
    const past = new Date(now.getTime() - 5 * 24 * 60 * 60_000)
    expect(formatTimeDifference(past, now, "day")).toBe("5 days later")
  })

  it("formats future seconds", () => {
    const future = new Date(now.getTime() + 5_000)
    expect(formatTimeDifference(future, now, "second")).toBe("5 seconds earlier")
  })

  it("uses 'from now' when to === Date.now()", () => {
    const future = new Date(Date.now() + 10_000)
    expect(formatTimeDifference(Date.now(), future)).toBe("10 seconds later")
  })
})
