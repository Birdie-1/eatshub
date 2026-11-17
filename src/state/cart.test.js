import { describe, expect, it } from 'vitest'
import { EMPTY_CART, calcTotals, cartReducer, formatChoices, makeCartItem, validateCoupon } from './cart'
import { bamiItem, rachaAhan, sampleCart, sukiItem } from './fixtures'

const noOffer = { ...rachaAhan, offer: null }
const cartWith = (items, overrides = {}) => ({ ...EMPTY_CART, restaurant: rachaAhan, items, ...overrides })

describe('makeCartItem', () => {
  it('unit price = menu + option + add-ons (สุกี้รวมมิตร = 127)', () => {
    expect(sukiItem.unitPrice).toBe(127)
    expect(sukiItem.lineTotal).toBe(127)
  })

  it('same choices give the same key regardless of add-on order', () => {
    const menu = { id: 'm', name: 'x', price: 10 }
    const a = { group: 'g', name: 'a', price: 1 }
    const b = { group: 'g', name: 'b', price: 2 }
    expect(makeCartItem({ restaurantId: 'r', menu, addons: [a, b] }).key).toBe(
      makeCartItem({ restaurantId: 'r', menu, addons: [b, a] }).key,
    )
  })

  it('a different note makes a separate line', () => {
    const menu = { id: 'm', name: 'x', price: 10 }
    expect(makeCartItem({ restaurantId: 'r', menu, note: 'ไม่ใส่ผัก' }).key).not.toBe(
      makeCartItem({ restaurantId: 'r', menu }).key,
    )
  })
})

describe('formatChoices', () => {
  it('option, then add-ons with their price', () => {
    expect(formatChoices(sukiItem)).toBe('สุกี้น้ำ, กุ้ง(15), ลูกชิ้นปลา(10)')
  })
  it('shows a paid option price and skips free add-on prices', () => {
    const item = { option: { label: 'ใหญ่', price: 30 }, addons: [{ group: 'g', name: 'ผักชี', price: 0 }] }
    expect(formatChoices(item)).toBe('ใหญ่(30), ผักชี')
  })
  it('empty when nothing was chosen', () => {
    expect(formatChoices(bamiItem)).toBe('')
  })
})

describe('calcTotals', () => {
  it('spec fixture: food 215 ฿ and 9 points', () => {
    const t = calcTotals(sampleCart)
    expect(t.food).toBe(215)
    expect(t.points).toBe(9)
    expect(t.itemCount).toBe(2)
  })

  it('no discounts: total = food + delivery', () => {
    const t = calcTotals({ ...sampleCart, restaurant: noOffer })
    expect(t).toMatchObject({ food: 215, delivery: 10, storeDiscount: 0, couponDiscount: 0, total: 225 })
  })

  it('store offer: 15% off when food ≥ 200', () => {
    const t = calcTotals(sampleCart)
    expect(t.storeDiscount).toBe(32.25)
    expect(t.total).toBe(192.75)
  })

  it('store offer: nothing below the minimum', () => {
    expect(calcTotals(cartWith([bamiItem])).storeDiscount).toBe(0)
  })

  it('store offer: capped at maxDiscount', () => {
    const big = { ...bamiItem, qty: 10 } // 880 × 15% = 132 → capped at 50
    expect(calcTotals(cartWith([big])).storeDiscount).toBe(50)
  })

  it('coupon applies when food meets its minimum', () => {
    const t = calcTotals({ ...sampleCart, coupon: 'EATSHUB20' })
    expect(t.couponDiscount).toBe(20)
    expect(t.couponApplies).toBe(true)
    expect(t.total).toBe(172.75) // 215 + 10 − 32.25 − 20
  })

  it('coupon below its minimum gives no discount', () => {
    const t = calcTotals({ ...sampleCart, coupon: 'NEWUSER100' }) // needs 300
    expect(t.couponDiscount).toBe(0)
    expect(t.couponApplies).toBe(false)
  })

  it('total never goes below 0', () => {
    const cheap = makeCartItem({ restaurantId: 'r', menu: { id: 'm', name: 'x', price: 300 } })
    const free = { ...noOffer, deliveryFee: 0 }
    const cart = cartWith([cheap], { restaurant: free, coupon: 'NEWUSER100' })
    expect(calcTotals(cart).total).toBe(200)
    const tooMuch = { ...free, offer: { percent: 100, minFood: 0 } }
    expect(calcTotals({ ...cart, restaurant: tooMuch }).total).toBe(0)
  })

  it('minimum order', () => {
    const small = makeCartItem({ restaurantId: 'r', menu: { id: 'm', name: 'x', price: 15 } })
    expect(calcTotals(cartWith([small])).meetsMinOrder).toBe(false)
    expect(calcTotals(sampleCart).meetsMinOrder).toBe(true)
  })

  it('empty cart is all zeros', () => {
    expect(calcTotals(EMPTY_CART)).toMatchObject({
      food: 0,
      delivery: 0,
      total: 0,
      points: 0,
      meetsMinOrder: false,
    })
  })
})

describe('validateCoupon', () => {
  it('accepts lower-case codes', () => {
    expect(validateCoupon(sampleCart, ' eatshub20 ')).toEqual({ ok: true, code: 'EATSHUB20' })
  })
  it('rejects unknown codes and unmet minimums', () => {
    expect(validateCoupon(sampleCart, 'NOPE').ok).toBe(false)
    expect(validateCoupon(sampleCart, 'NEWUSER100')).toEqual({ ok: false, error: 'ใช้ได้เมื่อค่าอาหารครบ 300 ฿' })
  })
})

describe('cartReducer', () => {
  it('adding the same item merges quantity', () => {
    let s = cartReducer(EMPTY_CART, { type: 'add', item: sukiItem, restaurant: rachaAhan })
    s = cartReducer(s, { type: 'add', item: sukiItem, restaurant: rachaAhan })
    expect(s.items).toHaveLength(1)
    expect(s.items[0]).toMatchObject({ qty: 2, lineTotal: 254 })
  })

  it('adding from another restaurant replaces the cart', () => {
    const other = { ...rachaAhan, id: 'other' }
    const s = cartReducer(sampleCart, { type: 'add', item: bamiItem, restaurant: other })
    expect(s.restaurant.id).toBe('other')
    expect(s.items).toHaveLength(1)
    expect(s.noteToStore).toBe('')
  })

  it('qty 0 removes the line, removing the last line empties the cart', () => {
    let s = cartReducer(sampleCart, { type: 'updateQty', key: sukiItem.key, qty: 0 })
    expect(s.items).toHaveLength(1)
    s = cartReducer(s, { type: 'remove', key: bamiItem.key })
    expect(s).toEqual(EMPTY_CART)
  })
})
