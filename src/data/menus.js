import suki from '@/shared/assets/images/suki.jpg'
import friedMeatballs from '@/shared/assets/images/fried-meatballs.jpg'
import takoyaki from '@/shared/assets/images/takoyaki.jpg'
import bamiMooDaeng from '@/shared/assets/images/bami-moo-daeng.jpg'
import bamiPedYangYai from '@/shared/assets/images/bami-ped-yang-yai.jpg'
import bamiPedYang from '@/shared/assets/images/bami-ped-yang.jpg'
import khaoMooDaeng from '@/shared/assets/images/khao-moo-daeng.jpg'
import khaoMooKrob from '@/shared/assets/images/khao-moo-krob.jpg'
import boatNoodlesPork from '@/shared/assets/images/boat-noodles-pork.jpg'
import boatNoodlesBeef from '@/shared/assets/images/boat-noodles-beef.jpg'
import kaoLaoMoo from '@/shared/assets/images/kao-lao-moo.jpg'
import kaoLaoNuea from '@/shared/assets/images/kao-lao-nuea.jpg'
import crispyPork from '@/shared/assets/images/crispy-pork.jpg'
import friedWonton from '@/shared/assets/images/fried-wonton.jpg'
import roselleDrink from '@/shared/assets/images/roselle-drink.jpg'
import meatballSkewersSauce from '@/shared/assets/images/meatball-skewers-sauce.jpg'
import meatballSkewers from '@/shared/assets/images/meatball-skewers.jpg'
import beefMeatballs from '@/shared/assets/images/beef-meatballs.jpg'
import meatballDisplay from '@/shared/assets/images/meatball-display.jpg'
import redSausage from '@/shared/assets/images/red-sausage.jpg'
import isanSausage from '@/shared/assets/images/isan-sausage.jpg'
import chrysanthemumDrink from '@/shared/assets/images/chrysanthemum-drink.jpg'
import mooThot from '@/shared/assets/images/moo-thot.jpg'
import mooThotChunks from '@/shared/assets/images/moo-thot-chunks.jpg'
import stickyRice from '@/shared/assets/images/sticky-rice.jpg'
import somTam from '@/shared/assets/images/som-tam.jpg'
import somTamPuPlaRa from '@/shared/assets/images/som-tam-pu-pla-ra.jpg'
import friedChicken from '@/shared/assets/images/fried-chicken.jpg'
import larb from '@/shared/assets/images/larb.jpg'
import thaiTea from '@/shared/assets/images/thai-tea.jpg'
import chickenCurry from '@/shared/assets/images/chicken-curry.jpg'
import tikkaMasala from '@/shared/assets/images/tikka-masala.jpg'
import butterChickenNaan from '@/shared/assets/images/butter-chicken-naan.jpg'
import chickenBiryani from '@/shared/assets/images/chicken-biryani.jpg'
import naan from '@/shared/assets/images/naan.jpg'
import samosa from '@/shared/assets/images/samosa.jpg'
import mangoLassi from '@/shared/assets/images/mango-lassi.jpg'
import masalaChai from '@/shared/assets/images/masala-chai.jpg'
import mooPing from '@/shared/assets/images/moo-ping.jpg'
import gaiYang from '@/shared/assets/images/gai-yang.jpg'
import korMooYang from '@/shared/assets/images/kor-moo-yang.jpg'
import grilledWings from '@/shared/assets/images/grilled-wings.jpg'
import grilledSkewersFire from '@/shared/assets/images/grilled-skewers-fire.jpg'

/**
 * Menu items for every restaurant (spec 04 §4–5). Prices in baht.
 *
 * MenuItem:
 * { id, restaurantId, name, description, price, image,
 *   options: [{ label, price }]                       // radio, pick exactly one; [] = no choice
 *   addonGroups: [{ name, min, max, items: [{ name, price }] }] }  // checkboxes, min..max picks
 *
 * `id` is unique across all restaurants. Which items a store shows and in which section
 * lives on the restaurant (`featuredMenuIds`, `menuSections` in restaurants.js).
 */

const spiceLevels = [
  { label: 'เผ็ดน้อย', price: 0 },
  { label: 'เผ็ดกลาง', price: 0 },
  { label: 'เผ็ดมาก', price: 0 },
]

const noodleTypes = [
  { label: 'เส้นเล็ก', price: 0 },
  { label: 'เส้นใหญ่', price: 0 },
  { label: 'เส้นหมี่', price: 0 },
  { label: 'บะหมี่', price: 0 },
  { label: 'วุ้นเส้น', price: 0 },
]

const boatNoodleExtras = {
  name: 'เพิ่มเติม',
  min: 0,
  max: 3,
  items: [
    { name: 'พิเศษ (เพิ่มเนื้อสัตว์)', price: 10 },
    { name: 'ไข่ลวก', price: 10 },
    { name: 'กากหมู', price: 5 },
  ],
}

const dippingSauces = [
  { label: 'น้ำจิ้มหวาน', price: 0 },
  { label: 'น้ำจิ้มเผ็ด', price: 0 },
  { label: 'น้ำจิ้มมะขาม', price: 0 },
]

export const menus = [
  // ── ราชาอาหาร (prices from spec 04) ─────────────────────────────
  {
    id: 'suki-ruam-mit',
    restaurantId: 'racha-ahan',
    name: 'สุกี้รวมมิตร',
    description: 'สุกี้รสเข้มข้น หมู ไก่ ผักรวม และไข่ เสิร์ฟพร้อมน้ำจิ้มสุกี้สูตรร้าน',
    price: 102,
    image: suki,
    options: [
      { label: 'สุกี้น้ำ', price: 0 },
      { label: 'สุกี้แห้ง', price: 0 },
    ],
    addonGroups: [
      {
        name: 'ตัวเลือกเพิ่มวัตถุดิบ',
        min: 1,
        max: 4,
        items: [
          { name: 'วุ้นเส้น', price: 10 },
          { name: 'กุ้ง', price: 15 },
          { name: 'ปลาหมึก', price: 15 },
          { name: 'ลูกชิ้นปลา', price: 10 },
          { name: 'เบคอน', price: 10 },
          { name: 'เห็ด', price: 10 },
        ],
      },
    ],
  },
  {
    id: 'luk-chin-thot',
    restaurantId: 'racha-ahan',
    name: 'ลูกชิ้นทอด',
    description: 'ลูกชิ้นหมูทอดกรอบ ราดน้ำจิ้มรสเด็ด',
    price: 15,
    image: friedMeatballs,
    options: [],
    addonGroups: [],
  },
  {
    id: 'takoyaki',
    restaurantId: 'racha-ahan',
    name: 'ทาโกะยากิ',
    description: 'ทาโกะยากิไส้ปลาหมึก 6 ลูก โรยปลาโอแห้งและสาหร่าย',
    price: 45,
    image: takoyaki,
    options: [],
    addonGroups: [],
  },
  {
    id: 'bami-moo-daeng',
    restaurantId: 'racha-ahan',
    name: 'บะหมี่หมูแดง',
    description: 'บะหมี่ไข่เส้นนุ่ม หมูแดงย่างเตาถ่าน ผักกวางตุ้ง',
    price: 88,
    image: bamiMooDaeng,
    options: [
      { label: 'แห้ง', price: 0 },
      { label: 'น้ำ', price: 0 },
    ],
    addonGroups: [],
  },
  {
    id: 'bami-ped-yang-yai',
    restaurantId: 'racha-ahan',
    name: 'บะหมี่เป็ดย่าง (ใหญ่)',
    description: 'บะหมี่เป็ดย่างชามใหญ่ เป็ดชิ้นโต หนังกรอบ',
    price: 150,
    image: bamiPedYangYai,
    options: [],
    addonGroups: [],
  },
  {
    id: 'khao-moo-daeng',
    restaurantId: 'racha-ahan',
    name: 'ข้าวหมูแดง',
    description: 'หมูแดงราดน้ำซอสสูตรเข้มข้น ไข่ต้ม และกุนเชียง',
    price: 88,
    image: khaoMooDaeng,
    options: [],
    addonGroups: [],
  },
  {
    id: 'khao-moo-krob',
    restaurantId: 'racha-ahan',
    name: 'ข้าวหมูกรอบ',
    description: 'หมูกรอบหนังพอง ราดน้ำซอส เสิร์ฟพร้อมแตงกวา',
    price: 88,
    image: khaoMooKrob,
    options: [],
    addonGroups: [],
  },
  {
    id: 'bami-ped-yang',
    restaurantId: 'racha-ahan',
    name: 'บะหมี่เป็ดย่าง',
    description: 'บะหมี่เป็ดย่างสูตรฮ่องกง',
    price: 95,
    image: bamiPedYang,
    options: [
      { label: 'ธรรมดา', price: 0 },
      { label: 'พิเศษ', price: 20 },
    ],
    addonGroups: [],
  },

  // ── แม่แดง ก๋วยเตี๋ยวลงเรือ ────────────────────────────────────
  {
    id: 'kuay-tiew-ruea-moo',
    restaurantId: 'mae-daeng',
    name: 'ก๋วยเตี๋ยวเรือหมู',
    description: 'น้ำซุปเข้มข้นสูตรโบราณ หมูสด หมูตุ๋น ลูกชิ้น',
    price: 50,
    image: boatNoodlesPork,
    options: noodleTypes,
    addonGroups: [boatNoodleExtras],
  },
  {
    id: 'kuay-tiew-ruea-nuea',
    restaurantId: 'mae-daeng',
    name: 'ก๋วยเตี๋ยวเรือเนื้อ',
    description: 'เนื้อสด เนื้อตุ๋นเปื่อยนุ่ม ลูกชิ้นเนื้อ',
    price: 60,
    image: boatNoodlesBeef,
    options: noodleTypes,
    addonGroups: [boatNoodleExtras],
  },
  {
    id: 'kao-lao-moo',
    restaurantId: 'mae-daeng',
    name: 'เกาเหลาหมู',
    description: 'เครื่องหมูรวมในน้ำซุปเรือ ไม่ใส่เส้น',
    price: 55,
    image: kaoLaoMoo,
    options: [],
    addonGroups: [],
  },
  {
    id: 'kao-lao-nuea',
    restaurantId: 'mae-daeng',
    name: 'เกาเหลาเนื้อ',
    description: 'เนื้อสด เนื้อตุ๋น ในน้ำซุปเรือ ไม่ใส่เส้น',
    price: 65,
    image: kaoLaoNuea,
    options: [],
    addonGroups: [],
  },
  {
    id: 'mae-daeng-moo-krob',
    restaurantId: 'mae-daeng',
    name: 'หมูกรอบ',
    description: 'หมูสามชั้นทอดกรอบ เสิร์ฟพร้อมน้ำจิ้มแจ่ว',
    price: 60,
    image: crispyPork,
    options: [],
    addonGroups: [],
  },
  {
    id: 'kiao-thot',
    restaurantId: 'mae-daeng',
    name: 'เกี๊ยวทอด',
    description: 'เกี๊ยวทอดกรอบ 10 ชิ้น พร้อมน้ำจิ้มบ๊วย',
    price: 40,
    image: friedWonton,
    options: [],
    addonGroups: [],
  },
  {
    id: 'nam-krachiap',
    restaurantId: 'mae-daeng',
    name: 'น้ำกระเจี๊ยบ',
    description: 'น้ำกระเจี๊ยบต้มเอง หวานน้อย',
    price: 20,
    image: roselleDrink,
    options: [],
    addonGroups: [],
  },

  // ── ลูกชิ้นทอด แม่ประนอม ────────────────────────────────────
  {
    id: 'luk-chin-ruam',
    restaurantId: 'mae-pranom',
    name: 'ลูกชิ้นรวม',
    description: 'ลูกชิ้นหมู เนื้อ ปลา และไส้กรอก รวม 5 ไม้',
    price: 40,
    image: meatballSkewersSauce,
    options: dippingSauces,
    addonGroups: [],
  },
  {
    id: 'luk-chin-moo',
    restaurantId: 'mae-pranom',
    name: 'ลูกชิ้นหมู',
    description: 'ลูกชิ้นหมูเด้ง 3 ไม้',
    price: 30,
    image: meatballSkewers,
    options: dippingSauces,
    addonGroups: [],
  },
  {
    id: 'luk-chin-nuea',
    restaurantId: 'mae-pranom',
    name: 'ลูกชิ้นเนื้อ',
    description: 'ลูกชิ้นเนื้อแท้ 3 ไม้',
    price: 35,
    image: beefMeatballs,
    options: dippingSauces,
    addonGroups: [],
  },
  {
    id: 'luk-chin-pla-raberd',
    restaurantId: 'mae-pranom',
    name: 'ลูกชิ้นปลาระเบิด',
    description: 'ลูกชิ้นปลาทอดพองกรอบ 3 ไม้',
    price: 35,
    image: meatballDisplay,
    options: [],
    addonGroups: [],
  },
  {
    id: 'sai-krok-daeng',
    restaurantId: 'mae-pranom',
    name: 'ไส้กรอกแดง',
    description: 'ไส้กรอกแดงทอด 2 ไม้',
    price: 25,
    image: redSausage,
    options: [],
    addonGroups: [],
  },
  {
    id: 'sai-krok-isan',
    restaurantId: 'mae-pranom',
    name: 'ไส้กรอกอีสาน',
    description: 'ไส้กรอกอีสานย่าง เสิร์ฟพร้อมขิง พริก กะหล่ำปลี',
    price: 40,
    image: isanSausage,
    options: [],
    addonGroups: [],
  },
  {
    id: 'nam-kek-huay',
    restaurantId: 'mae-pranom',
    name: 'น้ำเก๊กฮวย',
    description: 'น้ำเก๊กฮวยเย็น',
    price: 20,
    image: chrysanthemumDrink,
    options: [],
    addonGroups: [],
  },

  // ── หมูทอดเจ๊จง ──────────────────────────────────────────────
  {
    id: 'moo-thot',
    restaurantId: 'je-jong',
    name: 'หมูทอด',
    description: 'หมูหมักกระเทียมทอดกรอบนอกนุ่มใน',
    price: 60,
    image: mooThot,
    options: [
      { label: 'ธรรมดา', price: 0 },
      { label: 'ใหญ่', price: 30 },
    ],
    addonGroups: [],
  },
  {
    id: 'moo-thot-khao-niao',
    restaurantId: 'je-jong',
    name: 'หมูทอด + ข้าวเหนียว',
    description: 'ชุดหมูทอดพร้อมข้าวเหนียวร้อนๆ',
    price: 70,
    image: mooThotChunks,
    options: [],
    addonGroups: [],
  },
  {
    id: 'gai-thot',
    restaurantId: 'je-jong',
    name: 'ไก่ทอด',
    description: 'ไก่ทอดหาดใหญ่ โรยหอมเจียว',
    price: 50,
    image: friedChicken,
    options: [],
    addonGroups: [],
  },
  {
    id: 'som-tam-thai',
    restaurantId: 'je-jong',
    name: 'ส้มตำไทย',
    description: 'ส้มตำไทยใส่ถั่ว กุ้งแห้ง รสกลมกล่อม',
    price: 50,
    image: somTam,
    options: spiceLevels,
    addonGroups: [],
  },
  {
    id: 'som-tam-pu-pla-ra',
    restaurantId: 'je-jong',
    name: 'ส้มตำปูปลาร้า',
    description: 'ตำปูปลาร้าแซ่บนัว',
    price: 55,
    image: somTamPuPlaRa,
    options: spiceLevels,
    addonGroups: [],
  },
  {
    id: 'larb-moo',
    restaurantId: 'je-jong',
    name: 'ลาบหมู',
    description: 'ลาบหมูข้าวคั่วหอม เสิร์ฟพร้อมผักสด',
    price: 60,
    image: larb,
    options: spiceLevels,
    addonGroups: [],
  },
  {
    id: 'je-jong-khao-niao',
    restaurantId: 'je-jong',
    name: 'ข้าวเหนียว',
    description: 'ข้าวเหนียวนึ่ง 1 ห่อ',
    price: 10,
    image: stickyRice,
    options: [],
    addonGroups: [],
  },
  {
    id: 'cha-thai',
    restaurantId: 'je-jong',
    name: 'ชาไทยเย็น',
    description: 'ชาไทยใส่นม หวานมัน',
    price: 25,
    image: thaiTea,
    options: [],
    addonGroups: [],
  },

  // ── อินเดีย ฟูด (เจริญนคร) ─────────────────────────────────
  {
    id: 'kaeng-karee-gai',
    restaurantId: 'india-food',
    name: 'แกงกะหรี่ไก่',
    description: 'แกงกะหรี่ไก่สูตรอินเดียแท้ เครื่องเทศเข้มข้น',
    price: 120,
    image: chickenCurry,
    options: spiceLevels,
    addonGroups: [],
  },
  {
    id: 'chicken-tikka-masala',
    restaurantId: 'india-food',
    name: 'ไก่ทิกก้ามาซาล่า',
    description: 'ไก่ย่างทันดูร์ในซอสมะเขือเทศครีม',
    price: 150,
    image: tikkaMasala,
    options: [],
    addonGroups: [],
  },
  {
    id: 'butter-chicken',
    restaurantId: 'india-food',
    name: 'บัตเตอร์ชิกเก้น',
    description: 'ไก่ในซอสเนยมะเขือเทศ รสนุ่มละมุน',
    price: 160,
    image: butterChickenNaan,
    options: [],
    addonGroups: [],
  },
  {
    id: 'khao-mok-gai',
    restaurantId: 'india-food',
    name: 'ข้าวหมกไก่',
    description: 'ข้าวบัสมาติหุงเครื่องเทศ ไก่น่องนุ่ม พร้อมน้ำจิ้มเขียว',
    price: 110,
    image: chickenBiryani,
    options: [],
    addonGroups: [],
  },
  {
    id: 'naan',
    restaurantId: 'india-food',
    name: 'นาน',
    description: 'แป้งนานอบเตาทันดูร์ร้อนๆ',
    price: 40,
    image: naan,
    options: [
      { label: 'นานธรรมดา', price: 0 },
      { label: 'นานเนยกระเทียม', price: 15 },
      { label: 'นานชีส', price: 30 },
    ],
    addonGroups: [],
  },
  {
    id: 'samosa',
    restaurantId: 'india-food',
    name: 'ซาโมซ่า',
    description: 'แป้งทอดไส้มันฝรั่งและถั่ว 3 ชิ้น',
    price: 60,
    image: samosa,
    options: [],
    addonGroups: [],
  },
  {
    id: 'mango-lassi',
    restaurantId: 'india-food',
    name: 'ลัสซี่มะม่วง',
    description: 'โยเกิร์ตปั่นมะม่วงสด',
    price: 65,
    image: mangoLassi,
    options: [],
    addonGroups: [],
  },
  {
    id: 'masala-chai',
    restaurantId: 'india-food',
    name: 'ชามาซาล่า',
    description: 'ชานมเครื่องเทศร้อน',
    price: 40,
    image: masalaChai,
    options: [],
    addonGroups: [],
  },

  // ── ปิ้งย่างในตำนาน ──────────────────────────────────────────
  {
    id: 'moo-ping',
    restaurantId: 'ping-yang',
    name: 'หมูปิ้ง',
    description: 'หมูปิ้งนมสด 5 ไม้ ย่างเตาถ่าน',
    price: 50,
    image: mooPing,
    options: [],
    addonGroups: [],
  },
  {
    id: 'gai-yang',
    restaurantId: 'ping-yang',
    name: 'ไก่ย่าง',
    description: 'ไก่ย่างสูตรวิเชียรบุรี หนังกรอบ เนื้อฉ่ำ',
    price: 90,
    image: gaiYang,
    options: [
      { label: 'ครึ่งตัว', price: 0 },
      { label: 'ทั้งตัว', price: 80 },
    ],
    addonGroups: [],
  },
  {
    id: 'kor-moo-yang',
    restaurantId: 'ping-yang',
    name: 'คอหมูย่าง',
    description: 'คอหมูย่างหมักงา เสิร์ฟพร้อมน้ำจิ้มแจ่ว',
    price: 89,
    image: korMooYang,
    options: [
      { label: 'น้ำจิ้มแจ่ว', price: 0 },
      { label: 'น้ำจิ้มซีฟู้ด', price: 0 },
    ],
    addonGroups: [],
  },
  {
    id: 'peek-gai-yang',
    restaurantId: 'ping-yang',
    name: 'ปีกไก่ย่าง',
    description: 'ปีกไก่ย่างซอสน้ำผึ้ง 4 ชิ้น',
    price: 69,
    image: grilledWings,
    options: [],
    addonGroups: [],
  },
  {
    id: 'moo-num-siab-mai',
    restaurantId: 'ping-yang',
    name: 'หมูนุ่มเสียบไม้',
    description: 'หมูสันคอชิ้นโตย่างเตาถ่าน 3 ไม้',
    price: 75,
    image: grilledSkewersFire,
    options: [],
    addonGroups: [],
  },
  {
    id: 'ping-yang-khao-niao',
    restaurantId: 'ping-yang',
    name: 'ข้าวเหนียว',
    description: 'ข้าวเหนียวนึ่ง 1 ห่อ',
    price: 10,
    image: stickyRice,
    options: [],
    addonGroups: [],
  },
  {
    id: 'ping-yang-cha-thai',
    restaurantId: 'ping-yang',
    name: 'ชาไทยเย็น',
    description: 'ชาไทยใส่นม หวานมัน',
    price: 25,
    image: thaiTea,
    options: [],
    addonGroups: [],
  },
]

const byId = new Map(menus.map((m) => [m.id, m]))

/** Menu item by id, or null. */
export function getMenu(id) {
  return byId.get(id) ?? null
}

/** All menu items of a restaurant, in the order above. */
export function menusOf(restaurantId) {
  return menus.filter((m) => m.restaurantId === restaurantId)
}
