import { calcTotals } from './cart'

/**
 * Order domain logic (pure). Owner: phanuruk-p (#11, #12).
 *
 * Order:
 * { id,          // EH-BKK-YYMMDD-NNNNN
 *   createdAt,   // ISO string
 *   restaurant, items,
 *   notes: { noteToStore, noteToRider },
 *   totals,      // calcTotals() snapshot, frozen at checkout
 *   address: { label, detail },
 *   payment,     // 'cod' | 'promptpay' | 'paypal'
 *   rider }
 */

export const PAYMENT_METHODS = ['cod', 'promptpay', 'paypal']

/** EH-BKK-251117-00042 */
export function makeOrderId(date, seq) {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `EH-BKK-${yy}${mm}${dd}-${String(seq).padStart(5, '0')}`
}

/** Snapshot the cart into an order. Totals are frozen at checkout time. */
export function buildOrder({ cart, address, payment, rider = null, now = new Date(), seq = 1 }) {
  return {
    id: makeOrderId(now, seq),
    createdAt: now.toISOString(),
    restaurant: cart.restaurant,
    items: cart.items,
    notes: { noteToStore: cart.noteToStore, noteToRider: cart.noteToRider },
    totals: calcTotals(cart),
    address,
    payment,
    rider, // TODO(#12): DEFAULT_RIDER from src/data/riders.js (#10)
  }
}
