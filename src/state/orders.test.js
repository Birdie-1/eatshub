import { describe, expect, it } from 'vitest'
import { buildOrder, makeOrderId } from './orders'
import { sampleCart } from './fixtures'

describe('orders', () => {
  it('order id format EH-BKK-YYMMDD-NNNNN', () => {
    expect(makeOrderId(new Date(2025, 10, 17), 42)).toBe('EH-BKK-251117-00042')
  })

  it('buildOrder freezes the cart totals', () => {
    const order = buildOrder({
      cart: sampleCart,
      address: { label: 'บ้าน', detail: 'ซอย วัชรพล 3' },
      payment: 'cod',
      now: new Date(2025, 10, 17, 12, 0),
      seq: 1,
    })
    expect(order.id).toBe('EH-BKK-251117-00001')
    expect(order.totals.food).toBe(215)
    expect(order.items).toHaveLength(2)
  })
})
