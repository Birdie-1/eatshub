import { restaurants, toCartRestaurant } from './restaurants'
import { menusOf } from './menus'
import { addresses } from './addresses'
import { EMPTY_CART, makeCartItem } from '@/state/cart'
import { buildOrder, PAYMENT_METHODS } from '@/state/orders'

/** Cart line for a menu with its first option and the minimum required add-ons. */
const firstChoices = (restaurant, menu, qty) =>
  makeCartItem({
    restaurantId: restaurant.id,
    menu,
    option: menu.options[0] || null,
    addons: menu.addonGroups.flatMap((group) =>
      group.items.slice(0, group.min).map((addon) => ({ ...addon, group: group.name })),
    ),
    qty,
  })

// Seed once; an intentionally empty, already-initialized history stays empty.
export function createSampleOrders(now = new Date()) {
  return [1, 3, 7, 14].map((days, index) => {
    const restaurant = restaurants[index % restaurants.length]
    const item = firstChoices(restaurant, menusOf(restaurant.id)[0], 3)
    const order = buildOrder({
      cart: { ...EMPTY_CART, restaurant: toCartRestaurant(restaurant), items: [item] },
      address: { label: 'บ้าน', detail: 'ซอยวัชรพล 3 เขตสายไหม กรุงเทพฯ' },
      payment: ['cod', 'promptpay', 'paypal', 'cod'][index],
      now: new Date(now.getTime() - days * 86400000),
      seq: 9 + index,
    })
    return { ...order, cancelled: index === 1, rating: index === 0 ? 5 : null }
  })
}

/**
 * R3 demo: a job the rider app offers itself while online and idle, so the rider flow can be shown
 * without placing a customer order. Built like a real order from restaurant/menu data (rotating by `seq`,
 * enough of one dish to meet the minimum order) and offered for the usual 45 seconds. `simulated: true`
 * keeps it out of the customer's history (C11) and the back office's latest orders (A5).
 */
export function createDemoJob({ seq, now = new Date() }) {
  const restaurant = restaurants[seq % restaurants.length]
  const list = menusOf(restaurant.id)
  const menu = list[seq % list.length]
  const qty = Math.max(1, Math.ceil(restaurant.minOrder / firstChoices(restaurant, menu, 1).unitPrice))
  const order = buildOrder({
    cart: {
      ...EMPTY_CART,
      restaurant: toCartRestaurant(restaurant),
      items: [firstChoices(restaurant, menu, qty)],
    },
    address: addresses[seq % addresses.length],
    payment: PAYMENT_METHODS[seq % PAYMENT_METHODS.length],
    now,
    seq,
    offerToRider: true,
  })
  return { ...order, simulated: true }
}
