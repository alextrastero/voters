const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function timeAgo(timestamp: number, now: number): string {
  const diff = timestamp - now
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit)
  }
  return 'just now'
}

export function duration(ms: number): string {
  const minutes = Math.ceil(ms / 60_000)
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}
