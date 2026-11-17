import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildOrder } from './orders'
import { load, save } from './storage'

const OrdersContext = createContext(null)

/**
 * Order history store. Storage + createOrder/getOrder are ready to use;
 * getStatus/advance are placeholders for #12 (phanuruk-p) to implement.
 */
export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => load('orders', []))

  useEffect(() => save('orders', orders), [orders])

  const value = useMemo(
    () => ({
      /** Newest first */
      orders,
      /** => the new order. Caller should clear the cart afterwards. */
      createOrder({ cart, address, payment }) {
        const order = buildOrder({ cart, address, payment, seq: Math.floor(Math.random() * 90000) + 10000 })
        setOrders((prev) => [order, ...prev])
        return order
      },
      getOrder: (id) => orders.find((o) => o.id === id) ?? null,
      /** TODO(#12): derive 1..6 from order.createdAt (+ any skips from advance). */
      getStatus: () => 1,
      /** TODO(#12): demo button — jump the order to its next status. */
      advance: () => {},
    }),
    [orders],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

/** { orders, createOrder({ cart, address, payment }), getOrder(id), getStatus(order), advance(id) } */
export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside <AppProviders>')
  return ctx
}
