import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { EMPTY_CART, calcTotals, cartReducer, validateCoupon } from './cart'
import { load, save } from './storage'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, null, () => load('cart', EMPTY_CART))

  useEffect(() => save('cart', cart), [cart])

  const value = useMemo(
    () => ({
      ...cart,
      totals: calcTotals(cart),

      /**
       * Add a CartItem (build it with makeCartItem). `restaurant` is a snapshot of the store
       * ({ id, name, address, image, deliveryFee, minOrder, offer }) used for totals.
       * If the cart holds another restaurant's food it returns
       * { ok: false, reason: 'different-restaurant' } — show the "clear cart?" dialog,
       * then call add(item, restaurant, { replace: true }).
       */
      add(item, restaurant, { replace = false } = {}) {
        if (!replace && cart.restaurant && cart.restaurant.id !== restaurant.id) {
          return { ok: false, reason: 'different-restaurant' }
        }
        dispatch({ type: 'add', item, restaurant })
        return { ok: true }
      },
      updateQty: (key, qty) => dispatch({ type: 'updateQty', key, qty }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      setNotes: (notes) => dispatch({ type: 'setNotes', notes }),
      /** => { ok: true } or { ok: false, error: 'ข้อความภาษาไทย' } */
      applyCoupon(code) {
        const result = validateCoupon(cart, code)
        if (result.ok) dispatch({ type: 'setCoupon', code: result.code })
        return result.ok ? { ok: true } : result
      },
      removeCoupon: () => dispatch({ type: 'setCoupon', code: null }),
    }),
    [cart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/**
 * { restaurant, items, noteToStore, noteToRider, coupon, totals,
 *   add, updateQty, remove, clear, setNotes, applyCoupon, removeCoupon }
 */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <AppProviders>')
  return ctx
}
