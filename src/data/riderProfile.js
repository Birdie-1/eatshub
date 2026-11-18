import { DEFAULT_RIDER } from './riders'
import { restaurants } from './restaurants'
import { makeOrderId } from '@/state/orders'

/**
 * Rider app (R1–R7) data for the demo rider EA00001. It extends DEFAULT_RIDER, so the rider app, the
 * back-office list (A3) and customer tracking (C10) show one name, code, plate and rating.
 *
 * riderProfile: { ...DEFAULT_RIDER, email, partnerLevel, vehicle: { brand, model, plate, province },
 *   bankAccounts: [{ bank, number, holder }], ratingCounts: { 5, 4, 3, 2, 1 } }
 * createRiderActivity(now) → { jobs, missed }
 *   jobs: completed deliveries, newest first: { id, restaurantId, restaurantName, completedAt, minutes, km, earning }
 *   missed: job offers the rider let expire: [{ at }]
 * createCreditHistory(now) / createCashHistory(jobs, now) → entries, newest first:
 *   { id, type, label, amount (signed baht), at, orderId?, status? ('pending' | 'approved', withdrawals only) }
 *
 * Balances, today's numbers and the acceptance rate are never stored: they are summed from these records.
 * Everything is generated relative to `now` with nothing in the future, and the same `now` gives the same data.
 * The e-mail and bank accounts are fictional; account numbers are masked.
 */
export const RIDER_EARNING = 60
const MINUTE = 60000
const DAY = 24 * 60 * MINUTE
const BANGKOK_OFFSET = 7 * 60 * MINUTE // Thailand has no daylight saving time
const HISTORY_DAYS = 365

/** Midnight in Bangkok (as a timestamp) for the day containing `time`. */
export const startOfBangkokDay = (time) =>
  Math.floor((new Date(time).getTime() + BANGKOK_OFFSET) / DAY) * DAY - BANGKOK_OFFSET

const holder = `${DEFAULT_RIDER.firstName} ${DEFAULT_RIDER.lastName}`
export const riderProfile = {
  ...DEFAULT_RIDER,
  email: 'rider.demo@eatshub.app',
  partnerLevel: 'โกลด์',
  vehicle: { brand: 'Yamaha', model: 'Aerox', plate: DEFAULT_RIDER.plate, province: DEFAULT_RIDER.province },
  bankAccounts: [
    { bank: 'ธนาคารกสิกรไทย', number: 'xxx-x-x4821-x', holder },
    { bank: 'ธนาคารไทยพาณิชย์', number: 'xxx-x-x3307-x', holder },
    { bank: 'ธนาคารกรุงเทพ', number: 'xxx-x-x9154-x', holder },
  ],
  // Reviews per star; the average rounds to DEFAULT_RIDER.rating (4.5).
  ratingCounts: { 5: 64, 4: 26, 3: 6, 2: 2, 1: 2 },
}

export function averageRating(counts) {
  const entries = Object.entries(counts)
  const reviews = entries.reduce((total, [, count]) => total + count, 0)
  return reviews ? entries.reduce((total, [stars, count]) => total + stars * count, 0) / reviews : 0
}

export const creditChannels = ['ตู้ ABPO', 'LINE Call Center', 'โอนผ่านธนาคาร']

export function createRiderActivity(now = new Date()) {
  const time = new Date(now).getTime()
  const today = startOfBangkokDay(time)
  const jobs = []
  const missed = []
  // Oldest day first so order sequence numbers rise with time.
  for (let day = HISTORY_DAYS - 1; day >= 0; day--) {
    const start = today - day * DAY
    const weekday = new Date(start + BANGKOK_OFFSET).getUTCDay()
    const count = 4 + ((day * 37 + weekday * 11) % 5) + (weekday === 0 || weekday === 6 ? 2 : 0)
    for (let n = 0; n < count; n++) {
      const seed = day * 13 + n * 7
      const completedAt = start + (10 * 60 + n * 70 + (seed % 20)) * MINUTE // from 10:00, about every 70 min
      if (completedAt > time) break
      const restaurant = restaurants[seed % restaurants.length]
      jobs.push({
        id: makeOrderId(new Date(completedAt), 1000 + jobs.length),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        completedAt: new Date(completedAt).toISOString(),
        minutes: 18 + (seed % 25),
        km: Math.round((1.2 + (seed % 49) / 10) * 10) / 10,
        earning: RIDER_EARNING,
      })
    }
    const missedAt = start + 15 * 60 * MINUTE
    if (day % 23 === 5 && missedAt <= time) missed.push({ at: new Date(missedAt).toISOString() })
  }
  return { jobs: jobs.reverse(), missed: missed.reverse() }
}

/** Jobs completed in [from, to). */
export const jobsBetween = (jobs, from, to) =>
  jobs.filter((job) => {
    const time = Date.parse(job.completedAt)
    return time >= from && time < to
  })

export function summarizeJobs(jobs) {
  return {
    count: jobs.length,
    earning: jobs.reduce((total, job) => total + job.earning, 0),
    minutes: jobs.reduce((total, job) => total + job.minutes, 0),
    km: Math.round(jobs.reduce((total, job) => total + job.km, 0) * 100) / 100,
  }
}

/** Today's numbers for the home screen: income, offers received and offers accepted. */
export function riderToday({ jobs, missed }, now = new Date()) {
  const from = startOfBangkokDay(now)
  const accepted = jobsBetween(jobs, from, from + DAY)
  const missedToday = missed.filter((offer) => Date.parse(offer.at) >= from).length
  return {
    earning: summarizeJobs(accepted).earning,
    accepted: accepted.length,
    offered: accepted.length + missedToday,
  }
}

/** Lifetime acceptance rate in percent. */
export function acceptRate({ jobs, missed }) {
  const offered = jobs.length + missed.length
  return offered ? (jobs.length / offered) * 100 : 0
}

const entry = (id, type, label, amount, at, extra = {}) => ({
  id,
  type,
  label,
  amount,
  at: new Date(at).toISOString(),
  ...extra,
})
const byNewest = (a, b) => Date.parse(b.at) - Date.parse(a.at)

export function createCreditHistory(now = new Date()) {
  const time = new Date(now).getTime()
  return [
    entry('CR-001', 'opening', 'ยอดยกมา', 1000, time - 20 * DAY),
    entry('CR-002', 'topup', 'เติมเครดิต · โอนผ่านธนาคาร', 2000, time - 14 * DAY),
    entry('CR-003', 'food', 'ชำระค่าอาหาร', -350, time - 10 * DAY),
    entry('CR-004', 'topup', 'เติมเครดิต · ตู้ ABPO', 500, time - 6 * DAY),
    entry('CR-005', 'food', 'ชำระค่าอาหาร', -200, time - 3 * DAY),
    entry('CR-006', 'food', 'ชำระค่าอาหาร', -180, time - DAY),
    entry('CR-007', 'food', 'ชำระค่าอาหาร', -250, time - 2 * 60 * MINUTE),
  ].sort(byNewest)
}

/** Cash wallet: delivery income from today's and yesterday's jobs, a bonus and two withdrawals. */
export function createCashHistory(jobs, now = new Date()) {
  const time = new Date(now).getTime()
  const yesterday = startOfBangkokDay(time) - DAY
  const income = jobsBetween(jobs, yesterday, time + 1).map((job) =>
    entry(`CA-${job.id}`, 'income', 'รายได้ค่าส่ง', job.earning, job.completedAt, { orderId: job.id }),
  )
  return [
    entry('CA-001', 'opening', 'ยอดยกมา', 4000, time - 8 * DAY),
    entry('CA-002', 'withdraw', 'ถอนเงินเข้าบัญชี', -2000, time - 7 * DAY, { status: 'approved' }),
    entry('CA-003', 'bonus', 'โบนัสรายวัน', 200, yesterday + 22 * 60 * MINUTE),
    entry('CA-004', 'withdraw', 'ถอนเงินเข้าบัญชี', -1500, yesterday + 23 * 60 * MINUTE, { status: 'pending' }),
    ...income,
  ].sort(byNewest)
}

/** { balance, pending }: balance sums every entry; pending sums withdrawals awaiting approval. */
export function walletSummary(history) {
  return {
    balance: history.reduce((total, item) => total + item.amount, 0),
    pending: history
      .filter((item) => item.type === 'withdraw' && item.status === 'pending')
      .reduce((total, item) => total - item.amount, 0),
  }
}
