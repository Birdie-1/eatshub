import { calcTotals } from './cart'
import { DEFAULT_RIDER } from '@/data/riders'

export const PAYMENT_METHODS = ['cod', 'promptpay', 'paypal']
export const PAYMENT_LABELS = { cod: 'เก็บเงินปลายทาง', promptpay: 'PromptPay QR', paypal: 'PayPal' }
export const ORDER_STEP_MS = 8000
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

export function buildOrder({ cart, address, payment, rider = DEFAULT_RIDER, now = new Date(), seq = 1 }) {
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
  })
}

export function getStatus(order, now = Date.now()) {
  if (order.cancelled) return 6
  const elapsed = Math.max(0, now - Date.parse(order.createdAt) + (order.offsetMs || 0))
  return Math.min(5, Math.floor(elapsed / ORDER_STEP_MS) + 1)
}

export function advanceOrder(order, now = Date.now()) {
  const status = getStatus(order, now)
  if (status >= 5) return order
  return { ...order, offsetMs: (order.offsetMs || 0) + ORDER_STEP_MS }
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
