import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildOrder, getStatus, advanceOrder, nextOrderSequence, rateOrder } from './orders'
import { createSampleOrders } from '@/data/orders'
import { load, save } from './storage'

const OrdersContext = createContext(null)
export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = load('orders', null)
    const valid = Array.isArray(saved)
      ? saved.filter(
          (order) =>
            order?.id &&
            order?.totals &&
            order?.items &&
            order?.address &&
            Number.isFinite(Date.parse(order.createdAt)),
        )
      : []
    const seeded = load('history-seeded', false) || valid.some((order) => Object.hasOwn(order, 'rating'))
    return seeded ? valid : [...valid, ...createSampleOrders()]
  })
  const sequence = useRef(load('order-seq', 12))
  useEffect(() => {
    save('orders', orders)
    save('history-seeded', true)
  }, [orders])
  const value = useMemo(
    () => ({
      orders: [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
      createOrder({ cart, address, payment }) {
        const seq = nextOrderSequence(orders, sequence.current)
        const order = buildOrder({ cart, address, payment, seq })
        sequence.current = seq
        save('order-seq', seq)
        setOrders((previous) => [order, ...previous])
        return order
      },
      getOrder: (id) => orders.find((order) => order.id === id) ?? null,
      getStatus,
      advance: (id) =>
        setOrders((previous) => previous.map((order) => (order.id === id ? advanceOrder(order) : order))),
      rate: (id, stars) =>
        setOrders((previous) => previous.map((order) => (order.id === id ? rateOrder(order, stars) : order))),
    }),
    [orders],
  )
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used inside <AppProviders>')
  return context
}
