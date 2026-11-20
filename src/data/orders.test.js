import { describe, expect, it } from 'vitest'
import { createDemoJob } from './orders'
import { restaurants } from './restaurants'
import { getMenu } from './menus'
import { calcTotals, EMPTY_CART } from '@/state/cart'
import { canAcceptJob, getStatus, JOB_OFFER_MS } from '@/state/orders'

const now = new Date('2026-11-20T05:00:00Z')

describe('createDemoJob (R3 job the rider app offers itself)', () => {
  it('is a simulated order offered to the rider for the usual 45 seconds', () => {
    const job = createDemoJob({ seq: 20, now })
    expect(job.simulated).toBe(true)
    expect(job.id).toBe('EH-BKK-261120-00020')
    expect(job.jobOfferExpiresAt).toBe(new Date(now.getTime() + JOB_OFFER_MS).toISOString())
    expect(canAcceptJob(job, now.getTime())).toBe(true)
    expect(getStatus(job, now.getTime())).toBe(1)
  })
  it('rotates through every restaurant', () => {
    const ids = restaurants.map((_, seq) => createDemoJob({ seq, now }).restaurant.id)
    expect(new Set(ids)).toEqual(new Set(restaurants.map((r) => r.id)))
  })
  it.each(Array.from({ length: 30 }, (_, seq) => seq))(
    'seq %s: real menu items of that restaurant, totals from calcTotals, minimum order met',
    (seq) => {
      const job = createDemoJob({ seq, now })
      for (const item of job.items) expect(getMenu(item.menuId)?.restaurantId).toBe(job.restaurant.id)
      const totals = calcTotals({ ...EMPTY_CART, restaurant: job.restaurant, items: job.items })
      expect(job.totals).toEqual(totals)
      expect(totals.meetsMinOrder).toBe(true)
      expect(job.address.detail).toBeTruthy()
    },
  )
})
