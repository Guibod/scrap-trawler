type TimePrecision = 'day' | 'hour' | 'minute' | 'second'

export function formatTimeDifference(
  from: Date | number,
  to: Date | number = Date.now(),
  precision: TimePrecision = 'second'
): string {
  const fromMs = typeof from === "number" ? from : from.getTime()
  const toMs = typeof to === "number" ? to : to.getTime()
  const diff = toMs - fromMs
  const abs = Math.abs(diff)

  const seconds = Math.floor(abs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const entries: [number, string][] = [
    [days, "day"],
    [hours % 24, "hour"],
    [minutes % 60, "minute"],
    [seconds % 60, "second"],
  ]

  const cutoffIndex = { day: 0, hour: 1, minute: 2, second: 3 }[precision]

  const parts = entries
    .slice(0, cutoffIndex + 1)
    .filter(([value]) => value > 0)
    .map(([value, label]) => `${value} ${label}${value !== 1 ? 's' : ''}`)

  if (parts.length === 0) return `less than 1 ${precision}`

  const direction =
    Math.abs(toMs - Date.now()) < 1000
      ? diff > 0 ? 'ago' : 'from now'
      : diff > 0 ? 'later' : 'earlier'

  return `${parts.join(' ')} ${direction}`
}
