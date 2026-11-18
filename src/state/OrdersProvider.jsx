import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  acceptJob,
  advanceJob,
  advanceOrder,
  buildOrder,
  getStatus,
  nextOrderSequence,
  rateOrder,
} from './orders'
import { createSampleOrders } from '@/data/orders'
import { isRiderOnDuty } from './preferences'
import { load, save, subscribe } from './storage'

/** Keeps only complete order records from storage (saved earlier or written by another tab). */
export function restoreOrders(saved) {
  return Array.isArray(saved)
    ? saved.filter(
        (order) =>
          order?.id &&
          order?.totals &&
          order?.items &&
          order?.address &&
          Number.isFinite(Date.parse(order.createdAt)),
      )
    : []
}

const OrdersContext = createContext(null)

/**
 * Orders shared by the customer app (C8–C11), the rider app (R3–R4) and the back office (A5).
 * Every change is saved, and changes saved by another tab or window are picked up, so the customer and
 * rider apps can run side by side and follow each other.
 */
export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const valid = restoreOrders(load('orders', null))
    const seeded = load('history-seeded', false) || valid.some((order) => Object.hasOwn(order, 'rating'))
    return seeded ? valid : [...valid, ...createSampleOrders()]
  })
  const sequence = useRef(load('order-seq', 12))
  useEffect(() => {
    save('orders', orders)
    save('history-seeded', true)
  }, [orders])
  // Saving the same JSON back doesn't fire another event, so two tabs can't ping-pong.
  useEffect(() => subscribe('orders', (saved) => setOrders(restoreOrders(saved))), [])
  const value = useMemo(() => {
    const update = (id, change) =>
      setOrders((previous) => previous.map((order) => (order.id === id ? change(order) : order)))
    return {
      orders: [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
      createOrder({ cart, address, payment }) {
        const seq = nextOrderSequence(orders, sequence.current)
        const order = buildOrder({ cart, address, payment, seq, offerToRider: isRiderOnDuty() })
        sequence.current = seq
        save('order-seq', seq)
        setOrders((previous) => [order, ...previous])
        return order
      },
      getOrder: (id) => orders.find((order) => order.id === id) ?? null,
      getStatus,
      advance: (id) => update(id, (order) => advanceOrder(order)),
      rate: (id, stars) => update(id, (order) => rateOrder(order, stars)),
      /** R3: rider accepts an offered order (ignored once it's taken, expired or cancelled). */
      acceptJob: (id, { auto = false } = {}) => update(id, (order) => acceptJob(order, Date.now(), { auto })),
      /** R4: rider finished stage `from` (2 → 3 → 4 → 5); stale or repeated clicks are ignored. */
      advanceJob: (id, from) => update(id, (order) => advanceJob(order, from)),
    }
  }, [orders])
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used inside <AppProviders>')
  return context
}
