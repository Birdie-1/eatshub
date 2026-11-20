import { calcTotals } from './cart'
import { DEFAULT_RIDER } from '@/data/riders'

export const PAYMENT_METHODS = ['cod', 'promptpay', 'paypal']
export const PAYMENT_LABELS = { cod: 'เก็บเงินปลายทาง', promptpay: 'PromptPay QR', paypal: 'PayPal' }
export const ORDER_STEP_MS = 8000
/** How long a new order waits at stage 1 for the rider (R3 countdown) before the clock takes over. */
export const JOB_OFFER_MS = 45000
/** How long the rider home waits, online and idle, before offering itself a simulated job (R3 demo). */
export const DEMO_JOB_DELAY_MS = 5000
export const ORDER_STEPS = [
  { label: 'รอรับออเดอร์', message: 'ร้านกำลังยืนยันออเดอร์ของคุณ', minutes: 30 },
  { label: 'ไปยังร้านค้า', message: 'ไรเดอร์กำลังเดินทางไปที่ร้าน', minutes: 25 },
  { label: 'ถึงร้านค้า', message: 'ไรเดอร์ถึงร้านแล้ว กำลังรออาหาร', minutes: 15 },
  { label: 'ส่งอาหาร', message: 'กำลังนำส่งอาหารของคุณ', minutes: 8 },
  { label: 'จัดส่งเรียบร้อย', message: 'จัดส่งเรียบร้อย ขอให้อร่อยกับมื้อนี้!', minutes: 0 },
]

export function makeOrderId(date, seq) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).formatToParts(date)
  const part = (type) => parts.find((item) => item.type === type).value
  return `EH-BKK-${part('year')}${part('month')}${part('day')}-${String(seq).padStart(5, '0')}`
}

/**
 * Freezes the cart into an order. `offerToRider` (the rider app is signed in and online) makes the order
 * wait at stage 1 for up to JOB_OFFER_MS so the rider can accept it (R3); otherwise the clock runs.
 */
export function buildOrder({
  cart,
  address,
  payment,
  rider = DEFAULT_RIDER,
  now = new Date(),
  seq = 1,
  offerToRider = false,
}) {
  const totals = calcTotals(cart)
  if (!totals.meetsMinOrder) throw new Error('กรุณาตรวจสอบตะกร้าและยอดสั่งขั้นต่ำ')
  if (!PAYMENT_METHODS.includes(payment)) throw new Error('วิธีชำระเงินไม่ถูกต้อง')
  if (!address?.detail) throw new Error('กรุณาเลือกที่อยู่จัดส่ง')
  return structuredClone({
    id: makeOrderId(now, seq),
    createdAt: now.toISOString(),
    restaurant: cart.restaurant,
    items: cart.items,
    notes: { noteToStore: cart.noteToStore, noteToRider: cart.noteToRider },
    totals,
    address,
    payment,
    rider,
    ...(offerToRider && { jobOfferExpiresAt: new Date(now.getTime() + JOB_OFFER_MS).toISOString() }),
  })
}

/**
 * When the clock's stage 1 began. An offered order sits at stage 1 until the offer ends, then the clock
 * continues from there (stage 2 at expiry), so an unanswered offer never makes the order jump ahead.
 */
function clockStart(order) {
  return order.jobOfferExpiresAt
    ? Date.parse(order.jobOfferExpiresAt) - ORDER_STEP_MS
    : Date.parse(order.createdAt)
}

/**
 * Order stage 1–5 (ORDER_STEPS), or 6 when cancelled. Orders the rider accepted (`riderJob`) are at
 * whatever stage the rider has reached; every other order follows the clock.
 */
export function getStatus(order, now = Date.now()) {
  if (order.cancelled) return 6
  if (order.riderJob) return order.riderJob.step
  const elapsed = Math.max(0, now - clockStart(order) + (order.offsetMs || 0))
  return Math.min(5, Math.floor(elapsed / ORDER_STEP_MS) + 1)
}

/**
 * Customer demo skip (C10). On an order still offered to the rider it ends the offer (stage 2 now);
 * rider-driven orders only move from the rider app.
 */
export function advanceOrder(order, now = Date.now()) {
  const status = getStatus(order, now)
  if (status >= 5 || order.riderJob) return order
  if (canAcceptJob(order, now)) return endOffer(order, now)
  return { ...order, offsetMs: (order.offsetMs || 0) + ORDER_STEP_MS }
}

/** Ends a rider offer now; the clock then takes over from stage 2 (as when the 45 seconds run out). */
const endOffer = (order, now) => ({ ...order, jobOfferExpiresAt: new Date(now).toISOString() })

/** An order offered to the rider, still waiting at stage 1 and not yet accepted. */
export const canAcceptJob = (order, now = Date.now()) =>
  Boolean(order.jobOfferExpiresAt) && !order.riderJob && getStatus(order, now) === 1

/**
 * Rider accepts (R3): the order moves to stage 2 and from now on only the rider moves it.
 * `riderJob: { step: 2–5, times: [ISO time each stage from 2 was reached], auto?: true (auto-accept) }`.
 * Unchanged when the order can't be accepted.
 */
export function acceptJob(order, now = Date.now(), { auto = false } = {}) {
  if (!canAcceptJob(order, now)) return order
  return {
    ...order,
    riderJob: { step: 2, times: [new Date(now).toISOString()], ...(auto && { auto: true }) },
  }
}

/**
 * Rider rejects (R3): the offer ends now, so a customer order goes on with the clock from stage 2 exactly
 * as if nobody had answered. Unchanged when the order is no longer offered.
 */
export function rejectJob(order, now = Date.now()) {
  return canAcceptJob(order, now) ? endOffer(order, now) : order
}

/**
 * A simulated job (`simulated: true`, built by `createDemoJob` in src/data/orders.js) the rider rejected or
 * let run out. Nobody can see it any more, so it is dropped when the next one is offered. Jobs the rider
 * took stay, because R6 income counts them.
 */
export const isStaleDemoJob = (order, now = Date.now()) =>
  order.simulated === true && !order.riderJob && !canAcceptJob(order, now)

/**
 * Placing a customer order (C8) while the rider app is on duty (`onDuty`). The rider takes one job at a
 * time, so a simulated job still offered or in progress is dropped to free the rider for the real
 * order (delivered ones stay for R6 income). A rider busy with another customer order isn't offered the
 * new one (`offer: false`), so it follows the clock instead of waiting unseen.
 * => { orders: the list to keep, offer: whether to offer the new order to the rider }
 */
export function makeRoomForCustomerOrder(orders, onDuty, now = Date.now()) {
  if (!onDuty) return { orders, offer: false }
  const unfinished = (order) => (order.riderJob || canAcceptJob(order, now)) && getStatus(order, now) < 5
  if (orders.some((order) => !order.simulated && order.riderJob && unfinished(order)))
    return { orders, offer: false }
  return { orders: orders.filter((order) => !(order.simulated && unfinished(order))), offer: true }
}

/**
 * Rider button on R4 (ถึงร้านค้าแล้ว → รับอาหารแล้ว → ส่งอาหารแล้ว). `from` is the stage the button was
 * shown for, so a stale or repeated click can't skip or repeat a stage. Unchanged when it doesn't apply.
 */
export function advanceJob(order, from, now = Date.now()) {
  const job = order.riderJob
  if (!job || order.cancelled || job.step !== from || job.step >= 5) return order
  return {
    ...order,
    riderJob: { ...job, step: job.step + 1, times: [...job.times, new Date(now).toISOString()] },
  }
}

/** Timestamp (ms) at which each of the 5 stages was reached, or null for stages still ahead. */
export function stepTimes(order, now = Date.now()) {
  const status = getStatus(order, now)
  const created = Date.parse(order.createdAt)
  if (order.riderJob)
    return [created, ...[0, 1, 2, 3].map((i) => Date.parse(order.riderJob.times[i]) || null)]
  const start = clockStart(order) - (order.offsetMs || 0)
  return [0, 1, 2, 3, 4].map((i) => (i >= status ? null : i === 0 ? created : start + i * ORDER_STEP_MS))
}

/** How far along the route a rider-driven order's map rider goes before the rider app marks it delivered. */
const RIDER_WAIT_AT = 0.9

/**
 * The rider's ride to the customer (stage 4 ส่งอาหาร) for the C10 map, or null at any other stage.
 * The rider covers the route in one ORDER_STEP_MS from reaching stage 4. A rider-driven order has no set
 * end, so its rider stops at RIDER_WAIT_AT until the rider app delivers. `distanceKm` is the whole route.
 * Returns { progress: 0–1, km: distance left (1 decimal, ≥ 0.1), minutes: time left (≥ 1) }.
 */
export function deliveryLeg(order, now = Date.now(), distanceKm = 2) {
  if (getStatus(order, now) !== 4) return null
  const elapsed = Math.max(0, now - stepTimes(order, now)[3]) / ORDER_STEP_MS
  const progress = Math.min(order.riderJob ? RIDER_WAIT_AT : 1, elapsed)
  const left = 1 - progress
  return {
    progress,
    km: Math.max(0.1, Math.round(distanceKm * left * 10) / 10),
    minutes: Math.max(1, Math.ceil(ORDER_STEPS[3].minutes * left)),
  }
}

const isStars = (value) => Number.isInteger(value) && value >= 1 && value <= 5

/** Rated once the rider has stars; older sample orders only carry the restaurant `rating`. */
export const isRated = (order) => Boolean(order.riderRating || order.rating)

/**
 * Rate a delivered order once, Grab/LINE MAN style: rider stars are required, the restaurant is optional.
 * `rating` holds the restaurant stars (or null when skipped), `riderRating` the rider stars,
 * `review` an optional note to the restaurant (≤ 200 chars). Returns the order unchanged when it can't be rated.
 */
export function rateOrder(order, { rider, restaurant = null, review = '' }, now = Date.now()) {
  if (getStatus(order, now) !== 5 || isRated(order) || !isStars(rider)) return order
  if (restaurant != null && !isStars(restaurant)) return order
  return { ...order, rating: restaurant, riderRating: rider, review: String(review).trim().slice(0, 200) }
}

export function nextOrderSequence(orders, stored = 12) {
  return (
    Math.max(
      12,
      Number.isSafeInteger(stored) ? stored : 12,
      ...orders.map((order) => Number(order.id.split('-').at(-1))).filter(Number.isSafeInteger),
    ) + 1
  )
}

export function paymentStatus(order, status) {
  return order.cancelled ? 'ยกเลิก' : order.payment === 'cod' && status !== 5 ? 'รอชำระปลายทาง' : 'ชำระแล้ว'
}

export const formatOrderDate = (value) =>
  new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value))
