import { jobsBetween, startOfBangkokDay, summarizeJobs, RIDER_EARNING, riderProfile } from './riderProfile'
import { getRestaurant } from './restaurants'

/** Bangkok calendar grouping for R6. Period rows contain their source jobs and derived KPIs.
 * The current period stops at `now`; future months have no jobs and `future: true`.
 * No ledger or income total is stored separately from the shared activity history.
 */
const DAY = 86400000
const OFFSET = 7 * 3600000
export const bangkokDate = (time) => new Date(new Date(time).getTime() + OFFSET).toISOString().slice(0, 10)
export const bangkokYear = (time) => Number(bangkokDate(time).slice(0, 4))
export const monthStart = (year, month) => Date.UTC(year, month - 1, 1) - OFFSET
export function incomeDay(jobs, date, now = Date.now()) {
  const from = Date.parse(`${date}T00:00:00+07:00`)
  const rows = jobsBetween(jobs, from, Math.min(from + DAY, new Date(now).getTime() + 1))
  return { jobs: rows, ...summarizeJobs(rows) }
}
export function incomeMonths(jobs, year, now = Date.now()) {
  const time = new Date(now).getTime()
  return Array.from({ length: 12 }, (_, index) => {
    const start = monthStart(year, index + 1)
    const rows = jobsBetween(jobs, start, Math.min(monthStart(year, index + 2), time + 1))
    return { month: index + 1, future: start > time, jobs: rows, ...summarizeJobs(rows) }
  })
}
export const recentDays = (now, count = 30) =>
  Array.from({ length: count }, (_, index) => bangkokDate(startOfBangkokDay(now) - (count - index - 1) * DAY))

/** Completed, rider-driven demo orders only. No timed customer deliveries or duplicate IDs. */
export function completedRiderJobs(orders, now = Date.now()) {
  const seen = new Set()
  return orders.flatMap((order) => {
    const start = Date.parse(order.riderJob?.times?.[0])
    const end = Date.parse(order.riderJob?.times?.[3])
    if (
      !order.id ||
      !order.restaurant?.id ||
      !order.restaurant?.name ||
      seen.has(order.id) ||
      order.cancelled ||
      order.rider?.code !== riderProfile.code ||
      order.riderJob?.step !== 5 ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end < start ||
      end > new Date(now).getTime()
    )
      return []
    seen.add(order.id)
    return [
      {
        id: order.id,
        restaurantId: order.restaurant.id,
        restaurantName: order.restaurant.name,
        completedAt: new Date(end).toISOString(),
        earning: RIDER_EARNING,
        minutes: Math.round((end - start) / 6000) / 10,
        km: getRestaurant(order.restaurant.id)?.distanceKm ?? 0,
      },
    ]
  })
}
