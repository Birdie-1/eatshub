import { describe, expect, it } from 'vitest'
import {
  advanceOrder,
  buildOrder,
  getStatus,
  makeOrderId,
  nextOrderSequence,
  ORDER_STEP_MS,
  paymentStatus,
  isRated,
  rateOrder,
} from './orders'
import { sampleCart } from './fixtures'
import { DEFAULT_RIDER } from '@/data/riders'
import { createSampleOrders } from '@/data/orders'

const now = new Date('2026-11-17T05:00:00Z')
const create = (overrides = {}) =>
  buildOrder({
    cart: { ...sampleCart, coupon: 'EATSHUB20' },
    address: { label: 'บ้าน', detail: 'ที่อยู่ตัวอย่าง' },
    payment: 'cod',
    now,
    seq: 13,
    ...overrides,
  })

describe('checkout integration contracts', () => {
  it('freezes the same 172.75 total and 9 points across all payment methods', () => {
    for (const payment of ['cod', 'promptpay', 'paypal'])
      expect(create({ payment }).totals).toMatchObject({
        food: 215,
        delivery: 10,
        storeDiscount: 32.25,
        couponDiscount: 20,
        total: 172.75,
        points: 9,
      })
  })
  it('snapshots nested cart, address and rider independently of future changes', () => {
    const cart = structuredClone(sampleCart),
      address = { label: 'บ้าน', detail: 'เดิม' },
      rider = { ...DEFAULT_RIDER }
    const order = create({ cart, address, rider })
    cart.items[0].qty = 99
    cart.restaurant.name = 'เปลี่ยน'
    address.detail = 'ใหม่'
    rider.phone = 'ใหม่'
    expect(order.items[0].qty).toBe(1)
    expect(order.restaurant.name).toBe('ราชาอาหาร')
    expect(order.address.detail).toBe('เดิม')
    expect(order.rider.phone).toBe(DEFAULT_RIDER.phone)
  })
  it('uses the same default rider as the admin directory', () =>
    expect(create().rider).toMatchObject(DEFAULT_RIDER))
  it('rejects invalid checkout state instead of creating an incomplete order', () => {
    expect(() => create({ cart: { items: [] } })).toThrow()
    expect(() => create({ payment: 'card' })).toThrow()
    expect(() => create({ address: null })).toThrow()
  })
  it('generates the Bangkok date around a UTC day boundary', () =>
    expect(makeOrderId(new Date('2026-11-16T18:00:00Z'), 13)).toBe('EH-BKK-261117-00013'))
  it('continues numbering after sample, saved and in-memory sequences', () => {
    expect(nextOrderSequence([], null)).toBe(13)
    expect(nextOrderSequence([{ id: 'EH-BKK-261117-00014' }], 13)).toBe(15)
    expect(nextOrderSequence([], 20)).toBe(21)
    expect(nextOrderSequence([{ id: 'invalid' }], NaN)).toBe(13)
  })
})

describe('tracking clock', () => {
  it.each([
    [0, 1],
    [7999, 1],
    [8000, 2],
    [16000, 3],
    [24000, 4],
    [32000, 5],
    [100000, 5],
  ])('at %sms reaches stage %s', (elapsed, status) =>
    expect(getStatus(create(), now.getTime() + elapsed)).toBe(status),
  )
  it('recovers the correct status after JSON persistence and refresh', () => {
    const restored = JSON.parse(JSON.stringify(create()))
    expect(getStatus(restored, now.getTime() + 17000)).toBe(3)
  })
  it('advances exactly one stage immediately and persists demo skips', () => {
    const order = advanceOrder(create(), now.getTime() + 1000)
    expect(getStatus(order, now.getTime() + 1000)).toBe(2)
    expect(getStatus(JSON.parse(JSON.stringify(order)), now.getTime() + ORDER_STEP_MS)).toBe(3)
  })
  it('keeps finished and cancelled orders terminal', () => {
    const order = create(),
      cancelled = { ...order, cancelled: true }
    expect(advanceOrder(order, now.getTime() + 40000)).toBe(order)
    expect(getStatus(cancelled, now.getTime())).toBe(6)
    expect(advanceOrder(cancelled, now.getTime())).toBe(cancelled)
  })
  it('updates COD payment only after delivery, while online methods are paid', () => {
    expect(paymentStatus(create(), 1)).toBe('รอชำระปลายทาง')
    expect(paymentStatus(create(), 5)).toBe('ชำระแล้ว')
    expect(paymentStatus(create({ payment: 'promptpay' }), 1)).toBe('ชำระแล้ว')
  })
  it('seeds four diverse historical orders and reserves sequences 9 through 12', () => {
    const samples = createSampleOrders(now)
    expect(samples).toHaveLength(4)
    expect(samples.map((order) => getStatus(order, now.getTime()))).toEqual([5, 6, 5, 5])
    expect(samples[0].rating).toBe(5)
    expect(samples.every((order) => Date.parse(order.createdAt) < now.getTime())).toBe(true)
    expect(samples.map((order) => order.id.slice(-5))).toEqual(['00009', '00010', '00011', '00012'])
    expect(new Set(samples.map((order) => order.restaurant.id)).size).toBeGreaterThan(1)
  })
})

describe('rating a delivered order', () => {
  const delivered = () => ({ ...create(), offsetMs: 4 * ORDER_STEP_MS })
  const at = now.getTime()
  it('stores restaurant stars as rating, rider stars and a trimmed review', () =>
    expect(rateOrder(delivered(), { rider: 4, restaurant: 5, review: '  อร่อยมาก  ' }, at)).toMatchObject({
      rating: 5,
      riderRating: 4,
      review: 'อร่อยมาก',
    }))
  it('lets the customer skip the restaurant (rider stars only)', () => {
    const rated = rateOrder(delivered(), { rider: 5 }, at)
    expect(rated).toMatchObject({ rating: null, riderRating: 5, review: '' })
    expect(isRated(rated)).toBe(true)
  })
  it('caps the review at 200 characters', () =>
    expect(
      rateOrder(delivered(), { rider: 5, restaurant: 5, review: 'ก'.repeat(300) }, at).review,
    ).toHaveLength(200))
  it('ignores orders that are not delivered, cancelled or already rated', () => {
    const stars = { rider: 5, restaurant: 5 }
    const inProgress = create()
    const cancelled = { ...delivered(), cancelled: true }
    const legacyRated = { ...delivered(), rating: 3 }
    const riderOnly = { ...delivered(), rating: null, riderRating: 4 }
    for (const order of [inProgress, cancelled, legacyRated, riderOnly])
      expect(rateOrder(order, stars, at)).toBe(order)
    expect(isRated(delivered())).toBe(false)
  })
  it('requires whole rider stars from 1 to 5; restaurant stars, when given, must be valid too', () => {
    const order = delivered()
    for (const stars of [
      { restaurant: 5 },
      { rider: 0, restaurant: 5 },
      { rider: 4.5 },
      { rider: 5, restaurant: 6 },
      { rider: 5, restaurant: 2.5 },
    ])
      expect(rateOrder(order, stars, at)).toBe(order)
  })
})
