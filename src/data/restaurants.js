import bamiMooDaeng from '@/shared/assets/images/bami-moo-daeng.jpg'
import duckRice from '@/shared/assets/images/duck-rice.jpg'
import boatNoodlesPork from '@/shared/assets/images/boat-noodles-pork.jpg'
import noodleSoupGreens from '@/shared/assets/images/noodle-soup-greens.jpg'
import meatballSkewers from '@/shared/assets/images/meatball-skewers.jpg'
import skewerStall from '@/shared/assets/images/skewer-stall.jpg'
import mooThot from '@/shared/assets/images/moo-thot.jpg'
import isanSpread from '@/shared/assets/images/isan-spread.jpg'
import biryaniPlatter from '@/shared/assets/images/biryani-platter.jpg'
import curryBowl from '@/shared/assets/images/curry-bowl.jpg'
import gaiYang from '@/shared/assets/images/gai-yang.jpg'
import grillSmoke from '@/shared/assets/images/grill-smoke.jpg'
import bannerThaiSpread from '@/shared/assets/images/banner-thai-spread.jpg'
import bannerKraphao from '@/shared/assets/images/banner-kraphao.jpg'

import { menus } from './menus'

/**
 * Restaurants, food categories and home banners (spec 04 §2–4).
 *
 * Restaurant:
 * { id, name, types, categoryIds, image, cover, rating, reviewCount, minOrder, deliveryFee, distanceKm,
 *   promo,          // yellow promo line on cards, or null (text only — money rules use `offer`)
 *   offer,          // { percent, minFood, maxDiscount } used by calcTotals, or null
 *   recommended,    // blue "ร้านแนะนำ" badge
 *   address, phone, hours: [{ days, ranges }], reviews: [{ name, rating, text, date }],
 *   featuredMenuIds, menuSections: [{ title, menuIds }] }
 *
 * Menu items live in menus.js. Cart snapshots: use `toCartRestaurant(restaurant)`.
 */

/** 19 food categories in spec order. `icon` is a lucide-react icon name (see CategoryIcon). */
export const categories = [
  { id: 'seafood', name: 'อาหารทะเล', icon: 'Shrimp', color: 'sky' },
  { id: 'thai', name: 'อาหารไทย', icon: 'Flame', color: 'orange' },
  { id: 'international', name: 'อาหารนานาชาติ', icon: 'Globe', color: 'blue' },
  { id: 'tea-coffee', name: 'ชา กาแฟ', icon: 'Coffee', color: 'amber' },
  { id: 'bakery', name: 'เบเกอรี่', icon: 'Croissant', color: 'yellow' },
  { id: 'dessert', name: 'ของหวาน', icon: 'IceCreamCone', color: 'pink' },
  { id: 'street-food', name: 'อาหารริมทาง', icon: 'Store', color: 'red' },
  { id: 'buffet', name: 'บุฟเฟ่ต์', icon: 'UtensilsCrossed', color: 'violet' },
  { id: 'noodles', name: 'ก๋วยเตี๋ยว', icon: 'Soup', color: 'orange' },
  { id: 'pizza', name: 'พิซซ่า', icon: 'Pizza', color: 'red' },
  { id: 'burger', name: 'เบอร์เกอร์', icon: 'Hamburger', color: 'amber' },
  { id: 'steak', name: 'สเต๊ก', icon: 'Beef', color: 'rose' },
  { id: 'made-to-order', name: 'อาหารตามสั่ง', icon: 'EggFried', color: 'yellow' },
  { id: 'sushi', name: 'ซูชิ', icon: 'Fish', color: 'sky' },
  { id: 'clean', name: 'อาหารคลีน', icon: 'Salad', color: 'green' },
  { id: 'breakfast', name: 'อาหารเช้า', icon: 'Sunrise', color: 'amber' },
  { id: 'ramen', name: 'ราเมง', icon: 'CookingPot', color: 'rose' },
  { id: 'dim-sum', name: 'ติ่มซำ', icon: 'ChefHat', color: 'green' },
  { id: 'bubble-tea', name: 'ชานมไข่มุก', icon: 'CupSoda', color: 'violet' },
]

/**
 * Home carousel slides. `kind: 'brand'` = eatsHUB intro on yellow;
 * `kind: 'promo'` = photo with a dark overlay. `to` = where tapping the slide goes (or null).
 */
export const banners = [
  {
    id: 'brand',
    kind: 'brand',
    title: 'eatsHUB',
    subtitle: 'แอพที่เคียงข้าง\nความหิวของคุณ', // \n = line break on the slide
    image: bannerThaiSpread,
    to: null,
  },
  {
    id: 'coupon-eatshub20',
    kind: 'promo',
    eyebrow: 'คูปองส่วนลด',
    title: 'ใส่โค้ด EATSHUB20',
    subtitle: 'ลด 20 ฿ เมื่อสั่งครบ 100 ฿',
    image: bannerKraphao,
    to: '/app/search',
  },
  {
    id: 'racha-15',
    kind: 'promo',
    eyebrow: 'ราชาอาหาร',
    title: 'ลด 15% ทั้งร้าน',
    subtitle: 'เมื่อสั่งขั้นต่ำ 200 บาท',
    image: duckRice,
    to: '/app/restaurant/racha-ahan',
  },
]

const everyday = (ranges) => [{ days: 'จันทร์–อาทิตย์', ranges }]

export const restaurants = [
  {
    id: 'racha-ahan',
    name: 'ราชาอาหาร',
    types: ['ฟาสฟู้ด', 'ของว่าง'],
    categoryIds: ['made-to-order', 'noodles', 'thai'],
    image: bamiMooDaeng,
    cover: duckRice,
    rating: 4.5,
    reviewCount: 128,
    minOrder: 100,
    deliveryFee: 10,
    distanceKm: 3.83,
    promo: 'รับส่วนลด 15% เมื่อซื้อขั้นต่ำ 200 บาท',
    offer: { percent: 15, minFood: 200, maxDiscount: 50 },
    recommended: true,
    address: 'ซอยวัชรพล 3 แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ',
    phone: '02 123 4567',
    hours: everyday(['10:00–12:00', '14:00–19:00']),
    reviews: [
      { name: 'กรรณ***', rating: 5, text: 'สุกี้อร่อยมาก น้ำจิ้มเข้มข้น ส่งไวค่ะ', date: '2026-11-12' },
      { name: 'ธนา***', rating: 4, text: 'บะหมี่เป็ดย่างชามใหญ่คุ้มมาก เป็ดหนังกรอบ', date: '2026-11-08' },
      { name: 'พิม***', rating: 5, text: 'ข้าวหมูแดงน้ำราดอร่อย สั่งซ้ำแน่นอน', date: '2026-10-30' },
    ],
    featuredMenuIds: ['suki-ruam-mit', 'luk-chin-thot', 'takoyaki', 'bami-moo-daeng', 'bami-ped-yang-yai'],
    menuSections: [
      { title: 'ข้าว', menuIds: ['khao-moo-daeng', 'khao-moo-krob'] },
      { title: 'บะหมี่', menuIds: ['bami-moo-daeng', 'bami-ped-yang', 'bami-ped-yang-yai'] },
      { title: 'สุกี้และของทานเล่น', menuIds: ['suki-ruam-mit', 'luk-chin-thot', 'takoyaki'] },
    ],
  },
  {
    id: 'mae-daeng',
    name: 'แม่แดง ก๋วยเตี๋ยวลงเรือ',
    types: ['ก๋วยเตี๋ยว', 'ของว่าง'],
    categoryIds: ['noodles', 'thai'],
    image: boatNoodlesPork,
    cover: noodleSoupGreens,
    rating: 4.7,
    reviewCount: 342,
    minOrder: 50,
    deliveryFee: 15,
    distanceKm: 1.2,
    promo: null,
    offer: null,
    recommended: false,
    address: '45/2 ถนนพหลโยธิน แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพฯ',
    phone: '089 456 7812',
    hours: everyday(['09:00–16:00']),
    reviews: [
      { name: 'สมศ***', rating: 5, text: 'น้ำซุปเข้มข้นเหมือนกินที่ริมคลอง', date: '2026-11-14' },
      { name: 'วิภา***', rating: 4, text: 'เส้นเล็กเหนียวนุ่ม หมูกรอบกรอบจริง', date: '2026-11-02' },
    ],
    featuredMenuIds: ['kuay-tiew-ruea-moo', 'kuay-tiew-ruea-nuea', 'mae-daeng-moo-krob'],
    menuSections: [
      { title: 'ก๋วยเตี๋ยว', menuIds: ['kuay-tiew-ruea-moo', 'kuay-tiew-ruea-nuea'] },
      { title: 'เกาเหลา', menuIds: ['kao-lao-moo', 'kao-lao-nuea'] },
      { title: 'ของทานเล่นและเครื่องดื่ม', menuIds: ['mae-daeng-moo-krob', 'kiao-thot', 'nam-krachiap'] },
    ],
  },
  {
    id: 'mae-pranom',
    name: 'ลูกชิ้นทอด แม่ประนอม',
    types: ['ฟาสฟู้ด', 'ของว่าง'],
    categoryIds: ['street-food', 'thai'],
    image: meatballSkewers,
    cover: skewerStall,
    rating: 4.4,
    reviewCount: 96,
    minOrder: 60,
    deliveryFee: 10,
    distanceKm: 0.8,
    promo: null,
    offer: null,
    recommended: false,
    address: '12 ซอยรามอินทรา 5 แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพฯ',
    phone: '086 234 9910',
    hours: everyday(['15:00–22:00']),
    reviews: [
      { name: 'อรุณ***', rating: 5, text: 'น้ำจิ้มมะขามคือที่สุด', date: '2026-11-10' },
      { name: 'ปิย***', rating: 4, text: 'ลูกชิ้นเด้ง ไส้กรอกอีสานเปรี้ยวกำลังดี', date: '2026-10-28' },
    ],
    featuredMenuIds: ['luk-chin-ruam', 'sai-krok-isan'],
    menuSections: [
      { title: 'ลูกชิ้น', menuIds: ['luk-chin-ruam', 'luk-chin-moo', 'luk-chin-nuea', 'luk-chin-pla-raberd'] },
      { title: 'ไส้กรอก', menuIds: ['sai-krok-daeng', 'sai-krok-isan'] },
      { title: 'เครื่องดื่ม', menuIds: ['nam-kek-huay'] },
    ],
  },
  {
    id: 'je-jong',
    name: 'หมูทอดเจ๊จง',
    types: ['ฟาสฟู้ด', 'ของว่าง'],
    categoryIds: ['street-food', 'thai', 'made-to-order'],
    image: mooThot,
    cover: isanSpread,
    rating: 4.8,
    reviewCount: 512,
    minOrder: 80,
    deliveryFee: 20,
    distanceKm: 2.4,
    promo: 'สั่งครั้งแรกลด 15%',
    offer: null, // promo is display-only (#3)
    recommended: true,
    address: '88 ถนนสุขาภิบาล 5 แขวงออเงิน เขตสายไหม กรุงเทพฯ',
    phone: '081 777 2025',
    hours: everyday(['06:00–14:00']),
    reviews: [
      { name: 'จิร***', rating: 5, text: 'หมูทอดกรอบนอกนุ่มใน กินกับข้าวเหนียวฟินมาก', date: '2026-11-15' },
      { name: 'มานพ***', rating: 5, text: 'ส้มตำแซ่บ ส่งเร็ว', date: '2026-11-11' },
      { name: 'นุช***', rating: 4, text: 'ลาบหมูหอมข้าวคั่ว', date: '2026-11-01' },
    ],
    featuredMenuIds: ['moo-thot', 'moo-thot-khao-niao', 'som-tam-thai'],
    menuSections: [
      { title: 'หมูทอดและของทอด', menuIds: ['moo-thot', 'moo-thot-khao-niao', 'gai-thot'] },
      { title: 'ส้มตำและยำ', menuIds: ['som-tam-thai', 'som-tam-pu-pla-ra', 'larb-moo'] },
      { title: 'ข้าวเหนียวและเครื่องดื่ม', menuIds: ['je-jong-khao-niao', 'cha-thai'] },
    ],
  },
  {
    id: 'india-food',
    name: 'อินเดีย ฟูด (เจริญนคร)',
    types: ['ฟาสฟู้ด', 'อาหารอินเดีย'],
    categoryIds: ['international', 'made-to-order'],
    image: biryaniPlatter,
    cover: curryBowl,
    rating: 4.6,
    reviewCount: 204,
    minOrder: 100,
    deliveryFee: 25,
    distanceKm: 5,
    promo: null,
    offer: null,
    recommended: false,
    address: '1029 ถนนเจริญนคร แขวงบางลำภูล่าง เขตคลองสาน กรุงเทพฯ',
    phone: '02 438 5566',
    hours: everyday(['11:00–21:30']),
    reviews: [
      { name: 'Raj***', rating: 5, text: 'นานเนยกระเทียมหอมมาก แกงรสชาติแท้', date: '2026-11-09' },
      { name: 'สุดา***', rating: 4, text: 'ข้าวหมกไก่เครื่องเทศถึง ไก่นุ่ม', date: '2026-10-25' },
    ],
    featuredMenuIds: ['chicken-tikka-masala', 'khao-mok-gai', 'naan'],
    menuSections: [
      { title: 'แกง', menuIds: ['kaeng-karee-gai', 'chicken-tikka-masala', 'butter-chicken'] },
      { title: 'ข้าวและนาน', menuIds: ['khao-mok-gai', 'naan'] },
      { title: 'ทานเล่นและเครื่องดื่ม', menuIds: ['samosa', 'mango-lassi', 'masala-chai'] },
    ],
  },
  {
    id: 'ping-yang',
    name: 'ปิ้งย่างในตำนาน',
    types: ['ปิ้งย่าง'],
    categoryIds: ['street-food', 'thai', 'breakfast'],
    image: gaiYang,
    cover: grillSmoke,
    rating: 4.2,
    reviewCount: 77,
    minOrder: 70,
    deliveryFee: 15,
    distanceKm: 3.1,
    promo: null,
    offer: null,
    recommended: false,
    address: '230 ถนนวัชรพล แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ',
    phone: '092 515 3030',
    hours: everyday(['06:00–10:00', '16:00–21:00']),
    reviews: [
      { name: 'ศักดิ์***', rating: 4, text: 'หมูปิ้งนุ่ม หอมนมสด เหมาะกับมื้อเช้า', date: '2026-11-13' },
      { name: 'เพ็ญ***', rating: 4, text: 'ไก่ย่างหนังกรอบ น้ำจิ้มแจ่วอร่อย', date: '2026-11-04' },
    ],
    featuredMenuIds: ['moo-ping', 'gai-yang', 'kor-moo-yang'],
    menuSections: [
      {
        title: 'ปิ้งย่าง',
        menuIds: ['moo-ping', 'gai-yang', 'kor-moo-yang', 'peek-gai-yang', 'moo-num-siab-mai'],
      },
      { title: 'ข้าวเหนียวและเครื่องดื่ม', menuIds: ['ping-yang-khao-niao', 'ping-yang-cha-thai'] },
    ],
  },
]

const byId = new Map(restaurants.map((r) => [r.id, r]))

/** Restaurant by id (slug), or null. */
export function getRestaurant(id) {
  return byId.get(id) ?? null
}

/** Category by id, or null. */
export function getCategory(id) {
  return categories.find((c) => c.id === id) ?? null
}

/** Every distinct restaurant type, in first-seen order — the options of the filter sheet. */
export const restaurantTypes = [...new Set(restaurants.flatMap((r) => r.types))]

const normalize = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()

/**
 * Restaurants matching all given filters (empty filters match everything):
 * - `q`: case-insensitive substring of the name, a type, or any of its menu names
 * - `categoryId`: restaurant is in that category
 * - `type`: restaurant has that type
 */
export function findRestaurants({ q = '', categoryId = null, type = null } = {}) {
  const needle = normalize(q)
  return restaurants.filter((r) => {
    if (categoryId && !r.categoryIds.includes(categoryId)) return false
    if (type && !r.types.includes(type)) return false
    if (!needle) return true
    const haystack = [r.name, ...r.types, ...menus.filter((m) => m.restaurantId === r.id).map((m) => m.name)]
    return haystack.some((text) => normalize(text).includes(needle))
  })
}

/** Snapshot stored in the cart — pass to `useCart().add(item, toCartRestaurant(r))`. */
export function toCartRestaurant(r) {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    image: r.image,
    deliveryFee: r.deliveryFee,
    minOrder: r.minOrder,
    offer: r.offer,
  }
}
