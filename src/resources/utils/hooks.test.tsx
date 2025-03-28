import { describe, it, vi, expect } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import React, { useEffect, useState } from "react"
import { useDebouncedCallback, useDebouncedValue } from "~/resources/utils/hooks"

function DebounceTestComponent({
                                 onDebouncedCallback,
                                 onDebouncedValue,
                               }: {
  onDebouncedCallback: () => void
  onDebouncedValue: (value: string) => void
}) {
  const [input, setInput] = useState("")
  const debouncedValue = useDebouncedValue(input, 300)
  const triggerDebounced = useDebouncedCallback(onDebouncedCallback, 300)

  // Notify whenever debounced value changes
  useEffect(() => {
    onDebouncedValue(debouncedValue)
  }, [debouncedValue, onDebouncedValue])

  return (
    <input
      aria-label="test-input"
      value={input}
      onChange={(e) => {
        setInput(e.target.value)
        triggerDebounced()
      }}
    />
  )
}

describe("DebounceTestComponent", () => {
  it("debounces both callback and value", () => {
    vi.useFakeTimers()

    const onValue = vi.fn()
    const onCallback = vi.fn()

    render(
      <DebounceTestComponent
        onDebouncedCallback={onCallback}
        onDebouncedValue={onValue}
      />
    )

    const input = screen.getByLabelText("test-input")

    fireEvent.change(input, { target: { value: "H" } })
    fireEvent.change(input, { target: { value: "He" } })
    fireEvent.change(input, { target: { value: "Hel" } })

    // Initial call with ""
    expect(onValue).toHaveBeenCalledTimes(1)
    expect(onValue).toHaveBeenCalledWith("")

    // Nothing debounced yet
    expect(onCallback).not.toHaveBeenCalled()

    // Advance time to trigger debounce
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Debounced value + callback fire
    expect(onValue).toHaveBeenCalledTimes(2)
    expect(onValue).toHaveBeenLastCalledWith("Hel")
    expect(onCallback).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})