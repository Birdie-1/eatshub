import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  acceptJob,
  advanceJob,
  advanceOrder,
  buildOrder,
  canAcceptJob,
  CANCEL_REASONS,
  cancelJob,
  getStatus,
  isStaleDemoJob,
  makeRoomForCustomerOrder,
  JOB_OFFER_MS,
  ORDER_STEP_MS,
  rateOrder,
  paymentStatus,
  rejectJob,
  stepTimes,
} from './orders'
import { isRiderOnDuty } from './preferences'
import { sampleCart } from './fixtures'

const now = new Date('2026-11-18T05:00:00Z')
const t0 = now.getTime()
const create = (offerToRider = true) =>
  buildOrder({
    cart: { ...sampleCart, coupon: 'EATSHUB20' },
    address: { label: 'บ้าน', detail: 'ที่อยู่ตัวอย่าง' },
    payment: 'cod',
    now,
    seq: 13,
    offerToRider,
  })
/** Accept at +5s, then press each rider button one second apart. */
function deliver(order = create()) {
  let job = acceptJob(order, t0 + 5000)
  for (const step of [2, 3, 4]) job = advanceJob(job, step, t0 + 5000 + (step - 1) * 1000)
  return job
}

describe('rider offline: the order clock runs as before', () => {
  it('does not add an offer to the order', () =>
    expect(create(false)).not.toHaveProperty('jobOfferExpiresAt'))
  it.each([
    [0, 1],
    [8000, 2],
    [32000, 5],
  ])('at %sms reaches stage %s', (elapsed, status) =>
    expect(getStatus(create(false), t0 + elapsed)).toBe(status),
  )
  it('cannot be accepted by the rider', () => {
    const order = create(false)
    expect(canAcceptJob(order, t0)).toBe(false)
    expect(acceptJob(order, t0)).toBe(order)
  })
})

describe('rider online: the rider drives the order', () => {
  it('waits at stage 1 for the whole 45-second offer', () => {
    const order = create()
    expect(order.jobOfferExpiresAt).toBe(new Date(t0 + JOB_OFFER_MS).toISOString())
    for (const at of [0, 8000, 32000, JOB_OFFER_MS - 1]) expect(getStatus(order, t0 + at)).toBe(1)
    expect(canAcceptJob(order, t0 + JOB_OFFER_MS - 1)).toBe(true)
  })
  it('moves to stage 2 on accept, then one stage per button up to delivered', () => {
    let order = acceptJob(create(), t0 + 5000)
    expect(getStatus(order, t0 + 5000)).toBe(2)
    for (const step of [2, 3, 4]) {
      order = advanceJob(order, step, t0 + 6000)
      expect(getStatus(order, t0 + 6000)).toBe(step + 1)
    }
    // the clock no longer moves a rider order, even long after the offer window
    expect(getStatus(acceptJob(create(), t0 + 5000), t0 + 10 * 60000)).toBe(2)
  })
  it('marks jobs taken by auto-accept so R3 can say so', () => {
    expect(acceptJob(create(), t0, { auto: true }).riderJob).toEqual({
      step: 2,
      times: [now.toISOString()],
      auto: true,
    })
    expect(acceptJob(create(), t0).riderJob).not.toHaveProperty('auto')
    expect(advanceJob(acceptJob(create(), t0, { auto: true }), 2, t0).riderJob.auto).toBe(true)
  })
  it('records when each stage was reached', () => {
    const order = deliver()
    expect(order.riderJob.times).toEqual(
      [5000, 6000, 7000, 8000].map((ms) => new Date(t0 + ms).toISOString()),
    )
    expect(stepTimes(order)).toEqual([t0, t0 + 5000, t0 + 6000, t0 + 7000, t0 + 8000])
  })
  it('survives JSON persistence (refresh / another tab)', () => {
    const order = JSON.parse(JSON.stringify(acceptJob(create(), t0 + 5000)))
    expect(getStatus(order, t0 + 60000)).toBe(2)
    expect(getStatus(advanceJob(order, 2, t0 + 61000), t0 + 61000)).toBe(3)
  })
})

describe('offer timeout', () => {
  it('falls back to the clock after 45 seconds without an accept', () => {
    const order = create()
    const expiry = t0 + JOB_OFFER_MS
    expect(getStatus(order, expiry)).toBe(2)
    expect(getStatus(order, expiry + ORDER_STEP_MS)).toBe(3)
    expect(getStatus(order, expiry + 3 * ORDER_STEP_MS)).toBe(5)
    expect(canAcceptJob(order, expiry)).toBe(false)
    expect(acceptJob(order, expiry)).toBe(order)
  })
  it('the customer demo skip ends the wait and continues on the clock', () => {
    const skipped = advanceOrder(create(), t0 + 1000)
    expect(getStatus(skipped, t0 + 1000)).toBe(2)
    expect(canAcceptJob(skipped, t0 + 1000)).toBe(false)
  })
  it('times the clock stages from the end of the offer', () => {
    expect(stepTimes(create(), t0 + JOB_OFFER_MS + ORDER_STEP_MS)).toEqual([
      t0,
      t0 + JOB_OFFER_MS,
      t0 + JOB_OFFER_MS + ORDER_STEP_MS,
      null,
      null,
    ])
  })
})

describe('rider rejects the offer (R3)', () => {
  it('ends the offer now, so the order continues on the clock from stage 2', () => {
    const rejected = rejectJob(create(), t0 + 3000)
    expect(rejected.jobOfferExpiresAt).toBe(new Date(t0 + 3000).toISOString())
    expect(rejected).not.toHaveProperty('riderJob')
    expect(getStatus(rejected, t0 + 3000)).toBe(2)
    expect(canAcceptJob(rejected, t0 + 3000)).toBe(false)
    expect(acceptJob(rejected, t0 + 3000)).toBe(rejected)
  })
  it('ignores orders that are no longer offered', () => {
    const offline = create(false)
    const accepted = acceptJob(create(), t0 + 1000)
    const expired = create()
    expect(rejectJob(offline, t0)).toBe(offline)
    expect(rejectJob(accepted, t0 + 2000)).toBe(accepted)
    expect(rejectJob(expired, t0 + JOB_OFFER_MS)).toBe(expired)
  })
})

describe('isStaleDemoJob (simulated jobs nobody took)', () => {
  const demo = () => ({ ...create(), simulated: true })
  it('keeps a simulated job while it is still offered or once the rider took it', () => {
    expect(isStaleDemoJob(demo(), t0 + 1000)).toBe(false)
    expect(isStaleDemoJob(acceptJob(demo(), t0 + 1000), t0 + 10 * 60000)).toBe(false)
  })
  it('drops a simulated job once rejected or expired', () => {
    expect(isStaleDemoJob(rejectJob(demo(), t0 + 1000), t0 + 1000)).toBe(true)
    expect(isStaleDemoJob(demo(), t0 + JOB_OFFER_MS)).toBe(true)
  })
  it('never drops customer orders', () => {
    expect(isStaleDemoJob(create(), t0 + JOB_OFFER_MS)).toBe(false)
    expect(isStaleDemoJob(create(false), t0)).toBe(false)
  })
})

describe('makeRoomForCustomerOrder (a new customer order comes before demo jobs)', () => {
  const demo = (seq) => ({ ...create(), id: `demo-${seq}`, simulated: true })
  const at = t0 + 5000
  it('drops simulated jobs still offered or in progress, so the rider is free for the customer', () => {
    const offered = demo(1)
    const inProgress = acceptJob(demo(2), t0 + 1000)
    const { orders, offer } = makeRoomForCustomerOrder([offered, inProgress], true, at)
    expect(orders).toEqual([])
    expect(offer).toBe(true)
  })
  it('keeps delivered simulated jobs (R6 income) and every customer order', () => {
    const delivered = deliver(demo(3))
    const customer = create(false)
    expect(makeRoomForCustomerOrder([delivered, customer], true, at).orders).toEqual([delivered, customer])
  })
  it('does not offer to a rider busy with another customer order, and keeps that order', () => {
    const busy = acceptJob(create(), t0 + 1000)
    expect(makeRoomForCustomerOrder([busy], true, at)).toEqual({ orders: [busy], offer: false })
    expect(makeRoomForCustomerOrder([deliver()], true, at).offer).toBe(true) // delivered: free again
  })
  it('changes nothing when the rider app is not on duty', () => {
    const list = [acceptJob(demo(4), t0 + 1000)]
    expect(makeRoomForCustomerOrder(list, false, at)).toEqual({ orders: list, offer: false })
  })
})

describe('cancelJob (rider asks Call Center to cancel, R4)', () => {
  const reason = CANCEL_REASONS[0]
  it('cancels a job the rider holds at any stage before delivery, with the reason', () => {
    let job = acceptJob(create(), t0 + 1000)
    for (const step of [2, 3, 4]) {
      const cancelled = cancelJob(job, reason, t0 + 9000)
      expect(cancelled).toMatchObject({ cancelled: true, cancelReason: reason })
      expect(cancelled.cancelledAt).toBe(new Date(t0 + 9000).toISOString())
      expect(getStatus(cancelled, t0 + 9000)).toBe(6)
      expect(paymentStatus(cancelled, 6)).toBe('ยกเลิก')
      job = advanceJob(job, step, t0 + 2000)
    }
  })
  it('keeps the snapshot and the rider stages reached so far', () => {
    const job = advanceJob(acceptJob(create(), t0 + 1000), 2, t0 + 2000)
    const cancelled = cancelJob(job, reason, t0 + 3000)
    for (const key of ['items', 'totals', 'address', 'rider', 'restaurant', 'notes', 'riderJob'])
      expect(cancelled[key]).toEqual(job[key])
  })
  it('ignores orders the rider does not hold, delivered or already cancelled orders, and unknown reasons', () => {
    const offered = create()
    const delivered = deliver()
    const done = cancelJob(acceptJob(create(), t0 + 1000), reason, t0 + 2000)
    const job = acceptJob(create(), t0 + 1000)
    expect(cancelJob(offered, reason, t0)).toBe(offered)
    expect(cancelJob(create(false), reason, t0 + 9000)).toEqual(create(false))
    expect(cancelJob(delivered, reason, t0 + 9000)).toBe(delivered)
    expect(cancelJob(done, CANCEL_REASONS[1], t0 + 3000)).toBe(done)
    expect(cancelJob(job, 'เบื่อแล้ว', t0 + 2000)).toBe(job)
  })
  it('a cancelled simulated job is dropped with the other stale demo jobs', () => {
    const demo = acceptJob({ ...create(), simulated: true }, t0 + 1000)
    expect(isStaleDemoJob(demo, t0 + 2000)).toBe(false)
    expect(isStaleDemoJob(cancelJob(demo, reason, t0 + 2000), t0 + 2000)).toBe(true)
  })
})

describe('invalid rider actions leave the order unchanged', () => {
  const accepted = () => acceptJob(create(), t0 + 5000)
  it('cannot skip or go back a stage', () => {
    const order = accepted()
    expect(advanceJob(order, 3, t0 + 6000)).toBe(order)
    expect(advanceJob(order, 1, t0 + 6000)).toBe(order)
    const arrived = advanceJob(order, 2, t0 + 6000)
    expect(advanceJob(arrived, 2, t0 + 7000)).toBe(arrived) // stale double click
  })
  it('accepts an order only once', () => {
    const order = accepted()
    expect(canAcceptJob(order, t0 + 6000)).toBe(false)
    expect(acceptJob(order, t0 + 6000)).toBe(order)
  })
  it('cannot accept or advance delivered or cancelled orders', () => {
    const delivered = deliver()
    const cancelled = { ...create(), cancelled: true }
    expect(acceptJob(delivered, t0 + 9000)).toBe(delivered)
    expect(advanceJob(delivered, 5, t0 + 9000)).toBe(delivered)
    expect(acceptJob(cancelled, t0)).toBe(cancelled)
    expect(getStatus(cancelled, t0)).toBe(6)
    const cancelledJob = { ...accepted(), cancelled: true }
    expect(advanceJob(cancelledJob, 2, t0 + 6000)).toBe(cancelledJob)
    expect(getStatus(cancelledJob, t0 + 6000)).toBe(6)
  })
  it('ignores advancing an order the rider never accepted', () => {
    const order = create()
    expect(advanceJob(order, 1, t0)).toBe(order)
  })
  it('the customer demo skip does not move a rider-driven order', () => {
    const order = accepted()
    expect(advanceOrder(order, t0 + 6000)).toBe(order)
  })
})

describe('after the rider delivers', () => {
  it('the customer can rate the order', () =>
    expect(rateOrder(deliver(), { rider: 5, restaurant: 4 }, t0 + 9000)).toMatchObject({
      riderRating: 5,
      rating: 4,
    }))
  it('keeps the snapshot (items, totals, address, rider) unchanged', () => {
    const order = create()
    const job = deliver(order)
    for (const key of ['items', 'totals', 'address', 'rider', 'restaurant', 'notes', 'createdAt'])
      expect(job[key]).toEqual(order[key])
  })
})

describe('isRiderOnDuty (read when the customer places an order)', () => {
  afterEach(() => vi.unstubAllGlobals())
  const stub = (entries) =>
    vi.stubGlobal('localStorage', { getItem: (key) => entries[key] ?? null, setItem: vi.fn() })
  it('needs the rider signed in and online', () => {
    stub({ 'eatshub:session': '{"riderSignedIn":true}' })
    expect(isRiderOnDuty()).toBe(true)
    stub({ 'eatshub:session': '{"riderSignedIn":true}', 'eatshub:rider-status': '{"online":false}' })
    expect(isRiderOnDuty()).toBe(false)
  })
  it('is off when nobody has opened the rider app', () => {
    stub({})
    expect(isRiderOnDuty()).toBe(false)
    stub({ 'eatshub:session': '{"customerSignedIn":true}' })
    expect(isRiderOnDuty()).toBe(false)
  })
  it('is off when storage is corrupt or blocked', () => {
    stub({ 'eatshub:session': '{oops' })
    expect(isRiderOnDuty()).toBe(false)
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Blocked')
      },
    })
    expect(isRiderOnDuty()).toBe(false)
  })
})
