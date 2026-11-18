/**
 * Shared app state. Import hooks from here:
 *   import { useCart, useOrders, useSession, useAddress, useFavorites } from '@/state'
 */
export { useCart } from './CartProvider'
export { useOrders } from './OrdersProvider'
export { useSession } from './SessionProvider'
export { useAddress, useFavorites } from './preferences'
export { calcTotals, formatChoices, makeCartItem, EMPTY_CART } from './cart'

export { useRider } from './RiderProvider'
