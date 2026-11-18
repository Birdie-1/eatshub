import { DEFAULT_RIDER, riders } from './riders'
import { RIDER_EARNING, startOfBangkokDay } from './riderProfile'

/**
 * A5 rider performance for the last 30 Bangkok days: the same window as the R6 day strip
 * (`recentDays(now, 30)`), from midnight 29 days ago up to `now`.
 *
 * riderPerformance(activity, now) → { from, until, riders, summary, top, hours, peak }
 *   riders: one row per rider in `riders.js` order:
 *     { code, name, province, riderStatus, jobs, earning, minutes, avgMinutes, offered, acceptRate, rating }
 *   summary: { jobs, earning, minutes, offered, avgMinutes, acceptRate, rating } for all 17 riders,
 *     blocked ones included; minutes and rating are weighted by jobs
 *   top: the ten best active riders (`rankRiders`), each with `rank`
 *   hours: [{ hour, orders, riderHours }]: completed jobs and online rider-hours per Bangkok hour,
 *     10:00–22:00, widened if a demo job falls outside
 *   peak: { from, to, orders, riderHours }: the two consecutive hours with the most orders per online rider
 *
 * EA00001 reads the shared rider activity (the same jobs and missed offers as R2/R6) and
 * DEFAULT_RIDER.rating. The other 16 riders get fixed shifts and jobs generated from `fleet` below,
 * so the same `now` always gives the same numbers and nothing is after `now`.
 * Earnings are never stored: jobs × RIDER_EARNING.
 */
export const PERFORMANCE_DAYS = 30
const HOUR = 3600000
const DAY = 24 * HOUR
const OFFSET = 7 * HOUR
const OPEN = 10
const CLOSE = 22

// Orders per online rider in each hour from 10:00, relative to a rider's pace: lunch and dinner rushes.
const demand = [0.7, 1.6, 1.7, 1.0, 0.6, 0.5, 0.6, 1.0, 1.5, 1.3, 0.8, 0.5]
// EA00002–EA00017: [shift start, shift end (exclusive), jobs per online hour, rating, % of offers missed]
const fleet = [
  [10, 16, 0.7, 4.1, 9],
  [16, 22, 0.6, 3.9, 12],
  [10, 22, 0.75, 4.7, 3],
  [10, 15, 0.9, 4.8, 2],
  [15, 22, 0.8, 4.4, 5],
  [10, 22, 0.85, 4.9, 2],
  [11, 20, 0.7, 4.3, 6],
  [10, 22, 0.8, 4.6, 4],
  [17, 22, 0.5, 3.8, 15],
  [10, 22, 0.7, 4.6, 4],
  [10, 16, 0.85, 4.7, 3],
  [16, 22, 0.75, 4.5, 5],
  [10, 22, 0.6, 4.2, 7],
  [11, 21, 0.8, 4.8, 3],
  [10, 22, 0.9, 4.9, 1],
  [14, 22, 0.65, 4.4, 6],
]

/** Deterministic value in [0, 1) for the given integers. */
function noise(...values) {
  let hash = 2166136261
  for (const value of values) hash = Math.imul(hash ^ value, 16777619)
  return ((hash >>> 0) % 1000) / 1000
}
const bangkokHour = (time) => Math.floor(((time + OFFSET) % DAY) / HOUR)
const range = (from, to) => Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i)

export const performanceStart = (now) => startOfBangkokDay(now) - (PERFORMANCE_DAYS - 1) * DAY

/**
 * Every rider's working days in the window: [{ code, dayStart, hours (online hours), jobs: [{ at, minutes }] }].
 * EA00001's online hours run from 10:00 (or its first job) to the hour of its last job that day.
 */
export function fleetShifts(activity, now) {
  const until = new Date(now).getTime()
  const from = performanceStart(until)
  const shifts = []
  const days = new Map()
  for (const job of activity.jobs) {
    const at = Date.parse(job.completedAt)
    if (!(at >= from && at <= until)) continue
    const dayStart = startOfBangkokDay(at)
    if (!days.has(dayStart)) days.set(dayStart, [])
    days.get(dayStart).push({ at, minutes: job.minutes })
  }
  for (const [dayStart, jobs] of [...days].sort(([a], [b]) => a - b)) {
    const hours = jobs.map((job) => bangkokHour(job.at))
    shifts.push({
      code: riders[0].code,
      dayStart,
      hours: range(Math.min(OPEN, ...hours), Math.max(...hours) + 1),
      jobs,
    })
  }
  fleet.forEach(([start, end, pace], index) => {
    const code = riders[index + 1].code
    for (let dayStart = from; dayStart <= until; dayStart += DAY) {
      const dayNumber = Math.round((dayStart + OFFSET) / DAY)
      if ((dayNumber + index) % 7 === 0) continue // one day off a week
      const hours = range(start, end).filter((hour) => dayStart + hour * HOUR <= until)
      const jobs = hours.flatMap((hour) => {
        const count = Math.floor(demand[hour - OPEN] * pace + noise(dayNumber, index, hour))
        return range(0, count)
          .map((n) => ({
            at: dayStart + hour * HOUR + Math.floor(((n + 0.5) * 60) / count) * 60000,
            minutes: 16 + Math.floor(noise(dayNumber, index, hour, n) * 22),
          }))
          .filter((job) => job.at <= until)
      })
      if (hours.length) shifts.push({ code, dayStart, hours, jobs })
    }
  })
  return shifts
}

/** Active riders only, by jobs, then rating, then code; the first `limit` get a rank. */
export function rankRiders(rows, limit = 10) {
  return rows
    .filter((row) => row.riderStatus === 'active')
    .sort((a, b) => b.jobs - a.jobs || b.rating - a.rating || a.code.localeCompare(b.code))
    .slice(0, limit)
    .map((row, index) => ({ ...row, rank: index + 1 }))
}

function totals(rows) {
  const jobs = rows.reduce((total, row) => total + row.jobs, 0)
  const minutes = rows.reduce((total, row) => total + row.minutes, 0)
  const offered = rows.reduce((total, row) => total + row.offered, 0)
  const stars = rows.reduce((total, row) => total + row.rating * row.jobs, 0)
  return {
    jobs,
    earning: jobs * RIDER_EARNING,
    minutes,
    offered,
    avgMinutes: jobs ? minutes / jobs : 0,
    acceptRate: offered ? (jobs / offered) * 100 : 0,
    rating: jobs ? stars / jobs : 0,
  }
}

export function riderPerformance(activity, now) {
  const until = new Date(now).getTime()
  const from = performanceStart(until)
  const shifts = fleetShifts(activity, until)
  const missedFirst = activity.missed.filter((offer) => {
    const at = Date.parse(offer.at)
    return at >= from && at <= until
  }).length
  const rows = riders.map((rider, index) => {
    const own = shifts.filter((shift) => shift.code === rider.code).flatMap((shift) => shift.jobs)
    const jobs = own.length
    const rating = index === 0 ? DEFAULT_RIDER.rating : fleet[index - 1][3]
    const missPercent = index === 0 ? null : fleet[index - 1][4]
    const missed = index === 0 ? missedFirst : Math.round((jobs * missPercent) / (100 - missPercent))
    const minutes = own.reduce((total, job) => total + job.minutes, 0)
    return {
      code: rider.code,
      name: rider.name,
      province: rider.province,
      riderStatus: rider.riderStatus,
      ...totals([{ jobs, minutes, offered: jobs + missed, rating }]),
      rating,
    }
  })
  const allHours = shifts.flatMap((shift) => shift.hours)
  const hours = range(Math.min(OPEN, ...allHours), Math.max(CLOSE, ...allHours.map((h) => h + 1))).map(
    (hour) => ({
      hour,
      orders: shifts.reduce(
        (total, shift) => total + shift.jobs.filter((j) => bangkokHour(j.at) === hour).length,
        0,
      ),
      riderHours: shifts.filter((shift) => shift.hours.includes(hour)).length,
    }),
  )
  let peak = null
  for (let i = 0; i < hours.length - 1; i++) {
    const orders = hours[i].orders + hours[i + 1].orders
    const riderHours = hours[i].riderHours + hours[i + 1].riderHours
    if (riderHours && (!peak || orders / riderHours > peak.orders / peak.riderHours))
      peak = { from: hours[i].hour, to: hours[i].hour + 2, orders, riderHours }
  }
  return { from, until, riders: rows, summary: totals(rows), top: rankRiders(rows), hours, peak }
}
