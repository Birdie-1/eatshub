import { CartProvider } from './CartProvider'
import { OrdersProvider } from './OrdersProvider'
import { SessionProvider } from './SessionProvider'
import { RiderProvider } from './RiderProvider'

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        <OrdersProvider>
          <RiderProvider>{children}</RiderProvider>
        </OrdersProvider>
      </CartProvider>
    </SessionProvider>
  )
}
