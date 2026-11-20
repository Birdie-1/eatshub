import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  acceptJob,
  advanceJob,
  advanceOrder,
  buildOrder,
  getStatus,
  isStaleDemoJob,
  makeRoomForCustomerOrder,
  nextOrderSequence,
  rateOrder,
  rejectJob,
} from './orders'
import { addDemoReply, markChatRead, sendMessage } from './chat'
import { createDemoJob, createSampleOrders } from '@/data/orders'
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
 * Orders shared by the customer app (C8–C11, C13 chat), the rider app (R3–R4, R8 chat) and the back office (A5).
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
    // An unchanged order keeps the same list, so no-op updates (e.g. marking a read chat read) don't re-render.
    const update = (id, change) =>
      setOrders((previous) => {
        const next = previous.map((order) => (order.id === id ? change(order) : order))
        return next.some((order, index) => order !== previous[index]) ? next : previous
      })
    const nextSeq = () => {
      const seq = nextOrderSequence(orders, sequence.current)
      sequence.current = seq
      save('order-seq', seq)
      return seq
    }
    const sorted = [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    return {
      /** Customer orders (C11, A5) — simulated rider jobs left out. */
      orders: sorted.filter((order) => !order.simulated),
      /** Everything the rider app can be offered or has done, simulated jobs included (R2–R6). */
      riderOrders: sorted,
      /** C8. A rider app on duty is offered the order, ahead of any unfinished simulated job. */
      createOrder({ cart, address, payment }) {
        const room = makeRoomForCustomerOrder(orders, isRiderOnDuty())
        const order = buildOrder({ cart, address, payment, seq: nextSeq(), offerToRider: room.offer })
        const dropped = new Set(orders.filter((kept) => !room.orders.includes(kept)).map((gone) => gone.id))
        setOrders((previous) => [order, ...previous.filter((kept) => !dropped.has(kept.id))])
        return order
      },
      /** R3 demo: offer the rider a simulated job, dropping earlier ones that were rejected or ran out. */
      offerDemoJob() {
        const now = new Date()
        const job = createDemoJob({ seq: nextSeq(), now })
        setOrders((previous) => [job, ...previous.filter((order) => !isStaleDemoJob(order, now.getTime()))])
        return job
      },
      getOrder: (id) => orders.find((order) => order.id === id) ?? null,
      getStatus,
      advance: (id) => update(id, (order) => advanceOrder(order)),
      rate: (id, stars) => update(id, (order) => rateOrder(order, stars)),
      /** R3: rider accepts an offered order (ignored once it's taken, expired or cancelled). */
      acceptJob: (id, { auto = false } = {}) => update(id, (order) => acceptJob(order, Date.now(), { auto })),
      /** R3: rider rejects an offered order; a customer order then follows the clock from stage 2. */
      rejectJob: (id) => update(id, (order) => rejectJob(order)),
      /** R4: rider finished stage `from` (2 → 3 → 4 → 5); stale or repeated clicks are ignored. */
      advanceJob: (id, from) => update(id, (order) => advanceJob(order, from)),
      /** R8 / C13: `from` ('rider' | 'customer') sends a message; ignored once the chat is closed. */
      sendMessage: (id, from, text) => update(id, (order) => sendMessage(order, from, text)),
      /** R8 / C13: `side` has seen every message so far (clears its unread badge). */
      markChatRead: (id, side) => update(id, (order) => markChatRead(order, side)),
      /** R8: the simulated customer of a demo job answers the rider's latest message (once). */
      demoReply: (id) => update(id, (order) => addDemoReply(order)),
    }
  }, [orders])
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used inside <AppProviders>')
  return context
}
