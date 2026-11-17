import { EMPTY_CART, makeCartItem } from './cart'

/**
 * Sample data from spec 04 so screens can be built before the real flow exists.
 * Use in tests or while developing a screen — not in shipped code (see #13).
 */

/** Restaurant snapshot as stored in the cart (full restaurant data lives in src/data/restaurants.js, #3). */
export const rachaAhan = {
  id: 'racha-ahan',
  name: 'ราชาอาหาร',
  address: 'ซอยวัชรพล 3 แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ',
  image: null,
  deliveryFee: 10,
  minOrder: 100,
  offer: { percent: 15, minFood: 200, maxDiscount: 50 },
}

const sukiMenu = { id: 'suki-ruam-mit', name: 'สุกี้รวมมิตร', price: 102 }
const bamiMenu = { id: 'bami-moo-daeng', name: 'บะหมี่หมูแดง', price: 88 }

/** สุกี้รวมมิตร (น้ำ, กุ้ง, ลูกชิ้นปลา) = 127 ฿ */
export const sukiItem = makeCartItem({
  restaurantId: rachaAhan.id,
  menu: sukiMenu,
  option: { label: 'สุกี้น้ำ', price: 0 },
  addons: [
    { group: 'ตัวเลือกเพิ่มวัตถุดิบ', name: 'กุ้ง', price: 15 },
    { group: 'ตัวเลือกเพิ่มวัตถุดิบ', name: 'ลูกชิ้นปลา', price: 10 },
  ],
})

/** บะหมี่หมูแดง = 88 ฿ */
export const bamiItem = makeCartItem({ restaurantId: rachaAhan.id, menu: bamiMenu })

/** Cart from spec 04: food 215 ฿, 9 points. */
export const sampleCart = {
  ...EMPTY_CART,
  restaurant: rachaAhan,
  items: [sukiItem, bamiItem],
  noteToStore: 'ไม่ใส่ผักชี',
  noteToRider: 'ฝากไว้ที่ป้อมยาม',
}
