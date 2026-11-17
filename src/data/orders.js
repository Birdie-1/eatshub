import { restaurants, toCartRestaurant } from './restaurants'
import { menusOf } from './menus'
import { EMPTY_CART, makeCartItem } from '@/state/cart'
import { buildOrder } from '@/state/orders'

// Seed once; an intentionally empty, already-initialized history stays empty.
export function createSampleOrders(now = new Date()) {
  return [1, 3, 7, 14].map((days, index) => {
    const restaurant = restaurants[index % restaurants.length]
    const menu = menusOf(restaurant.id)[0]
    const item = makeCartItem({
      restaurantId: restaurant.id,
      menu,
      option: menu.options[0] || null,
      addons: menu.addonGroups.flatMap((group) =>
        group.items.slice(0, group.min).map((addon) => ({ ...addon, group: group.name })),
      ),
      qty: 3,
    })
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
