import { CartProvider } from './CartProvider'
import { OrdersProvider } from './OrdersProvider'
import { SessionProvider } from './SessionProvider'

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        <OrdersProvider>{children}</OrdersProvider>
      </CartProvider>
    </SessionProvider>
  )
}
