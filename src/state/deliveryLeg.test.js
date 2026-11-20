import { describe, expect, it } from 'vitest'
import { acceptJob, advanceJob, buildOrder, deliveryLeg, ORDER_STEP_MS } from './orders'
import { sampleCart } from './fixtures'

const now = new Date('2026-11-20T05:00:00Z')
const t0 = now.getTime()
const create = (offerToRider = false) =>
  buildOrder({
    cart: sampleCart,
    address: { label: 'บ้าน', detail: 'ที่อยู่ตัวอย่าง' },
    payment: 'cod',
    now,
    seq: 13,
    offerToRider,
  })
/** Clock orders reach stage 4 (ส่งอาหาร) three steps after they were placed. */
const rideStart = t0 + 3 * ORDER_STEP_MS

describe('deliveryLeg (C10 map while the rider rides to the customer)', () => {
  it('is null before and after the ride', () => {
    const order = create()
    expect(deliveryLeg(order, t0, 2)).toBeNull()
    expect(deliveryLeg(order, rideStart - 1, 2)).toBeNull()
    expect(deliveryLeg(order, rideStart + ORDER_STEP_MS, 2)).toBeNull()
    expect(deliveryLeg({ ...order, cancelled: true }, rideStart, 2)).toBeNull()
  })

  it('starts at the full distance and the stage minutes', () => {
    expect(deliveryLeg(create(), rideStart, 2.4)).toEqual({ progress: 0, km: 2.4, minutes: 8 })
  })

  it('counts distance and time down as the rider gets closer', () => {
    expect(deliveryLeg(create(), rideStart + ORDER_STEP_MS / 2, 2.4)).toEqual({
      progress: 0.5,
      km: 1.2,
      minutes: 4,
    })
  })

  it('never shows less than 0.1 km or 1 minute', () => {
    const leg = deliveryLeg(create(), rideStart + ORDER_STEP_MS - 1, 2.4)
    expect(leg.km).toBe(0.1)
    expect(leg.minutes).toBe(1)
  })

  it('follows the demo skip', () => {
    const skipped = { ...create(), offsetMs: 3 * ORDER_STEP_MS }
    expect(deliveryLeg(skipped, t0, 2).progress).toBe(0)
  })

  it('a rider-driven order waits short of the door until the rider app delivers it', () => {
    let job = acceptJob(create(true), t0 + 1000)
    job = advanceJob(job, 2, t0 + 2000)
    job = advanceJob(job, 3, t0 + 3000)
    expect(deliveryLeg(job, t0 + 3000, 2).progress).toBe(0)
    const later = deliveryLeg(job, t0 + 3000 + 10 * ORDER_STEP_MS, 2)
    expect(later.progress).toBe(0.9)
    expect(later.km).toBe(0.2)
    expect(deliveryLeg(advanceJob(job, 4, t0 + 4000), t0 + 4000, 2)).toBeNull()
  })
})
