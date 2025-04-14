import React, { useEffect, useState } from "react"

export function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 300): T {
  const timeout = React.useRef<ReturnType<typeof setTimeout>>()

  return React.useCallback(((...args: any[]) => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => fn(...args), delay)
  }) as T, [fn, delay])
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debounced
}