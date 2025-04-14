import { describe, it, vi, beforeEach, afterEach, expect } from "vitest"
import { EventBus } from "~/resources/utils/event-bus"

describe("EventBus", () => {
  const TEST_EVENT = "test:event"
  const payload = { foo: "bar" }

  let listener: ReturnType<typeof vi.fn>
  let unsubscribe: () => void

  beforeEach(() => {
    listener = vi.fn()
    unsubscribe = EventBus.on(TEST_EVENT, listener)
  })

  afterEach(() => {
    unsubscribe()
  })

  it("should call listener when event is emitted", () => {
    EventBus.emit(TEST_EVENT, payload)
    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith(payload)
  })

  it("should not call listener after unsubscribe", () => {
    unsubscribe()
    EventBus.emit(TEST_EVENT, payload)
    expect(listener).not.toHaveBeenCalled()
  })

  it("should handle multiple listeners", () => {
    const secondListener = vi.fn()
    const unsub2 = EventBus.on(TEST_EVENT, secondListener)

    EventBus.emit(TEST_EVENT, payload)

    expect(listener).toHaveBeenCalledOnce()
    expect(secondListener).toHaveBeenCalledOnce()

    unsub2()
  })

  it("should ignore events with unknown type", () => {
    EventBus.emit("unknown:event" as any, payload)
    expect(listener).not.toHaveBeenCalled()
  })
})
