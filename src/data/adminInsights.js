import { bangkokDate } from './riderReports'
import { startOfBangkokDay } from './riderProfile'

/** Admin rider earnings: rolling 365 Bangkok days from the same completed-job history as R6.
 * Daily/monthly records: { period: YYYY-MM-DD | YYYY-MM, earning, count }.
 * Peaks are aggregate period totals, not an individual transaction; ties select the latest period.
 */
export function riderEarningsInsights(jobs, now = Date.now()) {
  const from = startOfBangkokDay(now) - 364 * 86400000
  const until = new Date(now).getTime()
  const days = new Map()
  const months = new Map()
  const seen = new Set()
  for (const job of jobs) {
    const at = Date.parse(job.completedAt)
    if (
      !job.id ||
      seen.has(job.id) ||
      !Number.isFinite(at) ||
      at < from ||
      at > until ||
      !Number.isFinite(job.earning) ||
      job.earning < 0
    )
      continue
    seen.add(job.id)
    const date = bangkokDate(at)
    for (const [map, period] of [
      [days, date],
      [months, date.slice(0, 7)],
    ]) {
      const row = map.get(period) ?? { period, earning: 0, count: 0 }
      map.set(period, { ...row, earning: row.earning + job.earning, count: row.count + 1 })
    }
  }
  const sorted = (map) => [...map.values()].sort((a, b) => a.period.localeCompare(b.period))
  const daily = sorted(days)
  const monthly = sorted(months)
  const peak = (rows) =>
    [...rows].sort((a, b) => b.earning - a.earning || b.period.localeCompare(a.period))[0] ?? null
  return {
    daily,
    monthly,
    peakDay: peak(daily),
    peakMonth: peak(monthly),
    today: days.get(bangkokDate(now)) ?? { period: bangkokDate(now), earning: 0, count: 0 },
    month: months.get(bangkokDate(now).slice(0, 7)) ?? {
      period: bangkokDate(now).slice(0, 7),
      earning: 0,
      count: 0,
    },
    from: bangkokDate(from),
    until: bangkokDate(now),
  }
}
