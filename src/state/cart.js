import { findCoupon } from '@/data/coupons'

/**
 * Cart domain logic (pure, no React) — the single source of money rules.
 * See issue #2 §7. Every screen that shows money must read `calcTotals`, never recompute.
 *
 * Cart shape:
 * {
 *   restaurant: { id, name, address, image, deliveryFee, minOrder,
 *                 offer: { percent, minFood, maxDiscount } | null } | null,
 *   items: CartItem[],
 *   noteToStore: '', noteToRider: '',
 *   coupon: 'EATSHUB20' | null,
 * }
 *
 * CartItem:
 * { key, restaurantId, menuId, name, image,
 *   basePrice, option: { label, price } | null, addons: [{ group, name, price }],
 *   note, qty, unitPrice, lineTotal }   // note = per-item "หมายเหตุถึงร้าน" from C5
 */

export const EMPTY_CART = {
  restaurant: null,
  items: [],
  noteToStore: '',
  noteToRider: '',
  coupon: null,
}

/** Baht per point: points = ceil(food / 25) → 215 ฿ earns 9 points (spec 04). */
export const BAHT_PER_POINT = 25

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * Build a CartItem from a menu item + the customer's choices.
 * Same menu with the same option/add-ons/note gets the same `key`, so adding it again merges qty.
 */
export function makeCartItem({ restaurantId, menu, option = null, addons = [], note = '', qty = 1 }) {
  const unitPrice = round2(menu.price + (option?.price ?? 0) + addons.reduce((sum, a) => sum + a.price, 0))
  const key = [
    menu.id,
    option?.label ?? '',
    addons
      .map((a) => `${a.group}:${a.name}`)
      .sort()
      .join(','),
    note.trim(),
  ].join('|')
  return {
    key,
    restaurantId,
    menuId: menu.id,
    name: menu.name,
    image: menu.image ?? null,
    basePrice: menu.price,
    option,
    addons,
    note: note.trim(),
    qty,
    unitPrice,
    lineTotal: round2(unitPrice * qty),
  }
}

/** Store offer, e.g. 15% off when food ≥ 200 ฿, capped at 50 ฿. */
export function storeDiscountFor(food, offer) {
  if (!offer || food < offer.minFood) return 0
  return round2(Math.min((food * offer.percent) / 100, offer.maxDiscount ?? Infinity))
}

/** Coupon discount, or 0 when the code is unknown or food is below its minimum. */
export function couponDiscountFor(food, code) {
  const coupon = findCoupon(code)
  if (!coupon || food < coupon.minFood) return 0
  return coupon.amount
}

/**
 * All money on one screen comes from here.
 * @returns {{ food, delivery, storeDiscount, couponDiscount, total, points, itemCount,
 *             minOrder, meetsMinOrder, couponApplies }}
 */
export function calcTotals(cart) {
  const { restaurant, items = [], coupon } = cart ?? EMPTY_CART
  const food = round2(items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0))
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)
  const hasItems = items.length > 0

  const delivery = hasItems ? (restaurant?.deliveryFee ?? 0) : 0
  const storeDiscount = storeDiscountFor(food, restaurant?.offer)
  const couponDiscount = couponDiscountFor(food, coupon)
  const total = round2(Math.max(0, food + delivery - storeDiscount - couponDiscount))
  const minOrder = restaurant?.minOrder ?? 0

  return {
    food,
    delivery,
    storeDiscount,
    couponDiscount,
    total,
    points: Math.ceil(food / BAHT_PER_POINT),
    itemCount,
    minOrder,
    meetsMinOrder: hasItems && food >= minOrder,
    couponApplies: Boolean(coupon) && couponDiscount > 0,
  }
}

/** Check a code against the current cart: { ok: true, code } or { ok: false, error }. */
export function validateCoupon(cart, code) {
  const coupon = findCoupon(code)
  if (!coupon) return { ok: false, error: 'ไม่พบรหัสส่วนลดนี้' }
  const { food } = calcTotals(cart)
  if (food < coupon.minFood) return { ok: false, error: `ใช้ได้เมื่อค่าอาหารครบ ${coupon.minFood} ฿` }
  return { ok: true, code: coupon.code }
}

const withLine = (item, qty) => ({ ...item, qty, lineTotal: round2(item.unitPrice * qty) })

export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { item, restaurant } = action
      const base = state.restaurant && state.restaurant.id !== restaurant.id ? EMPTY_CART : state
      const existing = base.items.find((i) => i.key === item.key)
      const items = existing
        ? base.items.map((i) => (i.key === item.key ? withLine(i, i.qty + item.qty) : i))
        : [...base.items, withLine(item, item.qty)]
      return { ...base, restaurant, items }
    }
    case 'updateQty': {
      if (action.qty <= 0) return cartReducer(state, { type: 'remove', key: action.key })
      return {
        ...state,
        items: state.items.map((i) => (i.key === action.key ? withLine(i, action.qty) : i)),
      }
    }
    case 'remove': {
      const items = state.items.filter((i) => i.key !== action.key)
      return items.length ? { ...state, items } : EMPTY_CART
    }
    case 'clear':
      return EMPTY_CART
    case 'setNotes':
      return { ...state, ...action.notes }
    case 'setCoupon':
      return { ...state, coupon: action.code }
    case 'replace':
      return action.cart
    default:
      return state
  }
}
