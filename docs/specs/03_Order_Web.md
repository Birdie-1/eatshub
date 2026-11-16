# 03 · Order Web (Web Ordering System)

> สรุปจาก `03_FOC_OrderWeb V1.0.pdf` (103 หน้า, v1.0)

## ภาพรวม

เว็บไซต์ให้ลูกค้าค้นหาร้านจาก location สั่งอาหารเดลิเวอรี่ ชำระเงิน และติดตามสถานะ ฟีเจอร์ชุดเดียวกับแอปลูกค้า (ดู [04_Mobile_Order.md](04_Mobile_Order.md)) แต่เป็นเวอร์ชันเว็บ
- **Tech:** CakePHP + Bootstrap (responsive) · MySQL `eatshub` · config ที่ `/config/app.php` (SMTP, Datasource)
- **ดีไซน์:** พื้นขาว โลโก้ eatsHUB มุมซ้ายบน ปุ่มสีเหลือง footer สีเทา (Menu, Support, Call Center **02-666-1000**, ปุ่ม App Store/Google Play, ลิงก์ Facebook/LINE/Twitter) · สลับภาษา TH ได้

## Workflow: สั่งอาหารเดลิเวอรี่ออนไลน์ (Customer → Store → Rider)

1. ค้นหา location → แสดงร้านที่เปิด → เลือกร้าน → แสดงรายละเอียดร้าน → เลือกเมนูลงตะกร้า → กดชำระเงิน
2. ถ้ายังไม่ได้เป็นสมาชิก ต้องลงทะเบียน แล้วลงชื่อเข้าใช้
3. แสดงสรุปคำสั่งซื้อ → เลือกคูปองส่วนลด (ถ้ามี) → เลือก location (ถ้าต้องการเปลี่ยน) → คำนวณค่าสั่งซื้อ ส่วนลด และค่าจัดส่งตาม location
4. ระบุความต้องการถึงร้านค้า/คนขับ (ถ้ามี) → เลือกวิธีชำระเงิน → กดชำระ
5. ชำระสำเร็จ → หน้าติดตามคำสั่งซื้อ สถานะ **รอรับออเดอร์ (Waiting)** → ร้านและคนขับได้รับแจ้ง (ร้านหรือคนขับยกเลิกได้ → สถานะ **ยกเลิกออเดอร์**)
6. ร้านรับออเดอร์ → คนขับรับงาน สถานะ **ไปยังร้านค้า (Accepted)** → **ถึงร้านค้า (Arrived)** → **กำลังจัดส่ง (Delivering)** → ได้รับแจ้ง "ใกล้ถึง" → **จัดส่งเรียบร้อย (Delivered)**
7. รีวิวร้านค้าและคนขับ

## Sitemap

- **หน้าแรก:** ลงทะเบียน, เข้าสู่ระบบ, เปลี่ยนภาษา (TH), Banner หลัก, ค้นหาร้านอาหารจาก location, ร้านค้าแนะนำ, Banner โปรโมชั่น
- **ลงทะเบียน** / **เข้าสู่ระบบ** (Email/Password, Remember me, Login with Google)
- **บัญชีของฉัน:** การสั่งซื้อของฉัน (รายละเอียดออเดอร์, รีวิวร้านค้าและคนขับ), ข้อมูลส่วนตัว, การแจ้งเตือน, บันทึกที่อยู่, ร้านค้าถูกใจ, เปลี่ยนรหัสผ่าน, คะแนนสะสม, แนะนำเพื่อน, ออกจากระบบ · ลืมรหัสผ่าน · เงื่อนไขข้อตกลงและนโยบายความเป็นส่วนตัว · Chat (คนขับ, ร้านค้า)
- **ค้นหาร้านอาหาร:** Banner, ตัวกรองค้นหา/ประเภทร้าน, รายการร้านอาหารใกล้เคียง
  - **รายละเอียดร้านอาหาร:** แท็บ เมนู · ข้อมูลร้าน · ส่วนลด · รีวิว
  - **ตะกร้าสินค้า → ชำระเงิน:** เลือกที่อยู่จัดส่ง, การชำระเงิน, รายการสั่งซื้อ (คูปองส่วนลด), เลือกเมนูเพิ่มเติม

## ลำดับหน้าจอ

| Flow | รายละเอียด |
|---|---|
| **ลงทะเบียน/เข้าสู่ระบบ** | ฟอร์มลงทะเบียน (ชื่อ, นามสกุล, อีเมล, เบอร์โทร, เพศ, วันเกิด, รหัสผ่าน, รหัสแนะนำเพื่อน) → Sign In → เข้าหน้า "การสั่งซื้อของฉัน" เป็นค่าเริ่มต้น |
| **บัญชีของฉัน** | sidebar ซ้าย + กล่อง "คะแนนสะสมของฉัน" · การสั่งซื้อของฉัน (การ์ดออเดอร์: รูปร้าน, ชื่อร้าน, เลขออเดอร์, วันที่, badge สถานะ, ยอดเงิน, ปุ่ม "รายละเอียด"/"เขียนรีวิว"/ดาวที่ให้แล้ว) · ข้อมูลส่วนตัว · การแจ้งเตือน (กรองตามประเภท) · บันทึกที่อยู่ (บ้าน, ออฟฟิศ, อื่นๆ + ฟอร์มเพิ่ม) · ร้านค้าถูกใจ (♥) · เปลี่ยนรหัสผ่าน · คะแนนสะสม (ตารางเลขออเดอร์/ร้าน/คะแนน/วันที่) · แนะนำเพื่อน (โค้ด `CUSTOMER2985`, แชร์ Facebook/Google/Twitter, ได้ 25 ฿) |
| **ค้นหาร้าน** | หน้าแรก hero รูปอาหาร + ช่องค้นหา location → ไอคอน 4 ขั้นตอน → ร้านแนะนำแบบแถวเลื่อน → Banner โปรโมชั่น (Street Food, Gift voucher, Stamp) → โฆษณาแอป → หน้าผลค้นหา: hero "eatsHUB แอพที่เคียงข้างความหิวของคุณ", แถบไอคอนประเภทอาหาร 2 แถว, ตัวกรองด้านซ้าย, รายการร้าน (รูป, ชื่อ, ♥, ค่าส่ง, เวลา, badge ส่วนลด) |
| **หน้าร้านอาหาร** | header ร้าน (รูป, ชื่อ, ที่อยู่, ⭐ เรตติ้ง, ค่าส่ง, เวลาส่ง ~25 นาที, ระยะทาง) + แท็บ **เมนู** (หมวดด้านซ้าย, เมนูแนะนำเป็นการ์ดรูปใหญ่, รายการเมนูพร้อมปุ่ม "เพิ่ม") · **ข้อมูล** (ผู้ประกอบการ, ที่อยู่ คลิกแล้วเปิด Google Map, เวลาทำการรายวัน 2 ช่วง) · **ส่วนลด** (เช่น "ลดทันที 10% เมื่อสั่งครบ 200 บาท") · **รีวิว** · ตะกร้าสินค้าอยู่คอลัมน์ขวาตลอด |
| **สั่งอาหาร** | กด "เพิ่ม" → modal รายละเอียดเมนู: รูป, ราคา (102 ฿), ตัวเลือก (radio), ตัวเลือกเพิ่มเติม (checkbox +10–15 ฿), จำนวน, ปุ่ม "ใส่ตะกร้า" |
| **ชำระเงิน** | ① เลือกที่อยู่และเวลาจัดส่ง (การ์ดที่อยู่, จัดส่งทันที, หมายเหตุถึงร้านค้า/คนขับ) ② การชำระเงิน (เก็บเงินปลายทาง, PayPal / บัตร) · สรุปขวา: ค่าอาหาร, ค่าส่ง, คูปองส่วนลด, ส่วนลดร้านค้า, ส่วนลดค่าส่ง, ยอดสุทธิ, ปุ่ม "ชำระเงิน", คะแนนที่จะได้ |
| **ติดตามสถานะ** | ภาพประกอบ + stepper 3 จุด **ร้านรับออเดอร์ → ถึงร้านค้า → จัดส่งเรียบร้อย** + เวลาโดยประมาณ (30 → 20 → 10 → 5 นาที) · การ์ดรายละเอียดร้าน, คนขับ (รูป, ชื่อ, ⭐, เบอร์), รายการสั่งซื้อ, หมายเหตุ · ปุ่ม Chat ลอย ("Hi, Welcome to eatsHUB" → เลือกแชทกับร้าน/คนขับ) · กรณียกเลิก: ไอคอน ✕ แดง + แถบ "ยกเลิก" + ผู้ยกเลิกและเหตุผล |
| **รีวิว** | จากการสั่งซื้อของฉัน → "เขียนรีวิว" → modal ให้ดาวคนขับและร้านค้า + ข้อความ |

## สถานะออเดอร์ (ตาราง `orders`)

- `order_status`: Waiting → Accepted → Arrived → Delivering → Delivered · Cancel
- `restaurant_status`: Pending → Accepted → Cooked → Waiting → Delivering → Delivered · Cancel · Reject
- `driver_status`: Waiting · Accepted · Arrived · Delivering · Delivered · Cancel · Reject · Expired
- `cancel_type`: 0 = ลูกค้า, 1 = Rider, 2 = ร้านค้า, 3 = Admin
- `order_type`: pickup / delivery · `assoonas` = now (ส่งทันที) · `order_from`: Website / App
- `payment_method`: cod, Wallet, stripe, paypal · `payment_status`: P / NP
- `voucher_mode`: price / percentage / free_delivery

## ข้อมูลที่ใช้ทำ Mockup ได้

| ตาราง | ฟิลด์หลัก |
|---|---|
| `restaurants` | `restaurant_name`, `restaurant_logo`, `restaurant_cuisine`, `street_address`, `sourcelatitude/longitude`, เวลาเปิดปิดรายวัน (2 ช่วง/วัน), `minimum_order`, `free_delivery`, `estimate_time`, `restaurant_delivery/pickup/booktable`, `restaurant_commission`, `recommend`, `status_receive_order` |
| `categories` | `category_name`, `parent_id`, `sortorder` |
| `restaurant_menus` | `menu_name`, `menu_description`, `menu_image`, `price_option` (single/multiple), `popular_dish`, `spicy_dish`, `recommend_menu_status` |
| `menu_details` | ตัวเลือกราคา (`sub_name`, `orginal_price`) |
| `mainaddons` / `subaddons` / `menu_addons` | กลุ่ม Add-on และราคา |
| `carts` | `menu_name`, `subaddons_name`, `menu_price`, `quantity`, `total_price` |
| `orders` | `order_number`, ที่อยู่ปลายทาง, `delivery_charge`, `offer_amount`, `voucher_amount`, `tax_amount`, `tip_amount`, `order_sub_total`, `order_grand_total`, `distance`, `driver_income` + สถานะทั้งหมด |
| `vouchers` / `offers` | โค้ดส่วนลด (min/max order, quota, ช่วงวันที่) และส่วนลดของร้าน (ลูกค้าใหม่/ปกติ, ส่วนลดค่าส่ง) |
| อื่นๆ | `address_books`, `restaurant_favorite`, `reviews`, `customer_points`, `rewards`, `referrals`, `promotions`, `promotion_banners` |
