import { useNavigate } from 'react-router'
import { useCart, useOrders } from '@/state'
export function usePlaceOrder() {
  const cart = useCart()
  const { createOrder } = useOrders()
  const navigate = useNavigate()
  return ({ address, payment }) => {
    const order = createOrder({ cart, address, payment })
    // Navigate before clearing, so the checkout's empty-cart guard cannot win the transition.
    navigate(`/app/success/${order.id}`, { replace: true, flushSync: true })
    cart.clear()
    return order
  }
}
