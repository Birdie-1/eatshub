# Integration QA — issues #8–#13

ตรวจเมื่อ 17 พฤศจิกายน 2026 บน branch `eatshub_tong` โดยรวม main ถึง `d7354c5` (แก้รูปเมนู #21)
Production: ตอนตรวจรอบนี้ยังไม่ได้ deploy — deploy แล้วเมื่อ 18 พ.ย. 2026 ที่ https://eatshub-red.vercel.app (ดูหัวข้อ Production deploy ด้านล่าง)

## ตรวจด้วยโค้ด

- `npm run lint`
- `npm test`: ผ่าน 72 tests ใน 7 files ครอบคลุม domain/state, money rules, order snapshots, sequential IDs, tracking boundaries, demo status skips, storage initialization/empty state และ rider status
- `npm run build`: Vite static output พร้อม favicon/OG image และ rewrite ของ Vercel ที่มีอยู่แล้ว
- ไม่มี fixture imports ในหน้าที่ใช้งานจริง ข้อมูลออเดอร์ตัวอย่างสร้างจากข้อมูลร้าน/เมนูจริงใน repo
- Local production preview: `/`, deep link ออเดอร์, `/admin/riders`, favicon และ OG PNG ตอบ HTTP 200

## Lighthouse mobile (local production build)

Lighthouse 13.6.0, form factor mobile, simulated throttling, fresh Chrome profile, URL `http://localhost:4173/`

| Metric | ผล |
|---|---|
| Performance | **97 / 100** (เป้าหมาย ≥80) |
| FCP | 1.5 s |
| LCP | 2.6 s |
| Total Blocking Time | 0 ms |
| CLS | 0 |

เป็นผลวัดบนเครื่องสำหรับหน้า Landing ของ production build ยังไม่ใช่ผลจาก production URL หลัง deploy

## Browser QA ที่ทำแล้ว

| ส่วน | ผลการตรวจ |
|---|---|
| Landing/Login | customer guard, อีเมลว่างกดไม่ได้, Google จำลอง/ปุ่มเข้าสู่ระบบ, กลับหน้าที่ขอไว้ และ session หลัง refresh |
| อาหาร | ค้นหาสุกี้, สุกี้น้ำ+กุ้ง+ลูกชิ้นปลา =127, บะหมี่ 88, ค่าอาหารรวม215, dialog ข้ามร้านและยกเลิกเก็บของเดิม |
| ตะกร้า | คูปองผิดแสดง error, EATSHUB20 ลด20, ยอดสุทธิ172.75, หมายเหตุ, ป้องกัน Checkout ต่ำกว่าขั้นต่ำ, ลบรายการสุดท้าย, ปุ่มชำระเงินไม่ถูก bottom nav บัง |
| Checkout | ยอดจาก cart totals, ที่อยู่บ้าน/ออฟฟิศ, empty-cart redirect, refresh ไม่เสียตะกร้า |
| COD | สร้าง EH-BKK-261117-00013 ยอด172.75, clear cart, Success refresh ได้ |
| PromptPay | QR ตัวอย่าง, cancel เก็บ cart, ยืนยันจำลองสร้างออเดอร์00014 ยอด172.75, paid status |
| PayPal | ไม่มีช่องข้อมูลการเงิน, ยืนยันจำลองสร้างออเดอร์00015 ยอด172.75, ที่อยู่ออฟฟิศตรงกับที่เลือก |
| Tracking | COD เดินเองจนส่งแล้ว, payment status เปลี่ยน, skip และ refresh, rider/contact details, unknown ID, frozen total172.75 |
| History | ตัวอย่าง4 + ออเดอร์ใหม่3, ล่าสุดอยู่บนสุด, badge/rating, ประวัติยังอยู่หลัง logout/login และ refresh |
| Admin | search phone, Block/เหตุผล, Reactivate, pagination11–17, desktop table, mobile cards, session/route guard และ logout |
| Responsive | 360px ไม่มี horizontal page overflow; 1280/1920px กรอบโทรศัพท์390px อยู่กลางจอ; tablet/admin ตรวจในรอบก่อนตาม BACK_OFFICE_PLAN.md |
| Console | ไม่พบ error/warning ระหว่างทดสอบ flow ที่ระบุ |

เลขออเดอร์และเวลาจาก browser QA เป็นข้อมูลสาธิต ไม่ใช่ธุรกรรมจริง

ทดสอบซ้ำทั้งสามวิธีบน desktop phone frame ที่ viewport 1280px แล้ว: COD 00016, PromptPay 00017 และ PayPal 00018 แต่ละวิธียอด 172.75 บาทตรงกันจากตะกร้า → Checkout → Success → Tracking และไม่พบ console error/warning

## สิ่งที่ยังต้องตรวจ/ตัดสินใจก่อน production

- [ ] Safari บน iPhone จริง และ Chrome บน Android จริง รวม keyboard/safe area ของอุปกรณ์
- [ ] วน flow 3 วิธีชำระบนอุปกรณ์จริงและตรวจใน Incognito จริง (ทดสอบ fresh/blocked storage ใน unit tests แล้ว)
- [ ] QR หมดอายุครบ10นาทีและสร้างใหม่บนอุปกรณ์จริง (มี UI/ตรรกะแล้ว ยังไม่ได้รอครบ10นาทีด้วยมือ)
- [x] เลือกบัญชี/ทีม/โปรเจกต์ Vercel และโดเมน — ทีม `birdie-1s-projects` โปรเจกต์ `eatshub` โดเมน `eatshub-red.vercel.app`
- [ ] ตั้ง og:image เป็น absolute URL ของโดเมนจริง แล้วทดสอบ LINE preview
- [ ] ตรวจ review/merge ของงานใน branch และ production branch main
- [x] Deploy production และตรวจ deep links จาก URL จริง (18 พ.ย. 2026)

ยังไม่ปิด issue #13 เพราะเกณฑ์อุปกรณ์จริงและ production ยังไม่ครบ

## A5 — แดชบอร์ดหลังบ้าน (#23)

ตรวจเมื่อ 18 พฤศจิกายน 2026 บน `feature/23-admin-dashboard` จาก main `48f38b0`

- โค้ด: `lint`, `format:check`, tests **81 ข้อ / 8 ไฟล์**, `build` ผ่านทั้งหมด มีคำเตือนขนาด JS chunk เกิน 500 kB จาก Vite (ประมาณ 511 kB ก่อน gzip) แต่ build สำเร็จ
- ทดสอบ invariant ใหม่ 9 ข้อ: ยอดขาย/ออเดอร์รายเดือนและ Top 5 ตรง KPI, จำนวนเมนู/ร้าน/ไรเดอร์จาก catalog, สถานะไรเดอร์, ล่าสุด 5 รายการ รวมการยกเลิก/ข้อมูลว่างโดยไม่แก้ input
- Browser emulation: 360×800, 1280×900 และ 1440×1000 ไม่มี horizontal page overflow; 360px KPI 2 คอลัมน์ ส่วนอื่น 1 คอลัมน์ ออเดอร์เป็นการ์ด; desktop เป็นตาราง รูปร้านทั้ง 5 โหลดครบ
- Admin ที่ยังไม่เข้าใช้ถูกส่งไป Sign In; เข้าตามปกติไป `/admin`, ขอ `/admin/riders` โดยตรงแล้วเข้าสู่ระบบกลับไปหน้าเดิม; refresh เก็บ session และ dashboard เมนู active เฉพาะ `/admin`
- Drawer มือถือไปไรเดอร์และกลับแดชบอร์ดได้ ปิดเองหลังเลือกเมนู
- กราฟ: ArrowRight และ End เลือกเดือนและแสดงค่าเต็มถูกต้อง ปุ่มเดือนก่อนหน้าและตารางค่ารายเดือนทำงาน
- สั่ง COD จากแอปลูกค้าได้ `EH-BKK-261118-00024` บะหมี่หมูแดง 2 รายการ ยอด **186.00 บาท** แสดงบนสุดในออเดอร์ล่าสุดหลังเปิดหลังบ้าน โดยรวมไม่เกิน 5 รายการ สถานะเปลี่ยนอัตโนมัติจนจัดส่งเรียบร้อย รายงานตัวอย่างยังแสดง 177,321 บาท / 946 ออเดอร์
- Empty state ของ `RecentOrders` ตรวจด้วย server rendering โดยส่ง `orders: []` ผ่าน Vite SSR (ไม่ได้ล้างประวัติใน browser ของผู้ใช้) ไม่ใช่การตรวจ empty state ใน browser
- ไม่พบ console error/warning ใน browser ระหว่าง flow นี้
- ยังไม่ได้ตรวจบน iPhone/Android จริง และยังไม่ deploy production ตามคำสั่งผู้ใช้

## Production deploy

Deploy เมื่อ 18 พฤศจิกายน 2026 จาก main `0415da0` (รวม C10 #28)

- Vercel ทีม `birdie-1s-projects` โปรเจกต์ `eatshub` ผูกกับ GitHub `Birdie-1/eatshub` แล้ว merge เข้า main จะ deploy production อัตโนมัติ และแต่ละ PR ได้ preview URL
- Production URL: https://eatshub-red.vercel.app เปิดได้สาธารณะ (URL เฉพาะ deployment ต้องล็อกอิน Vercel)
- ก่อน deploy: `lint`, `format:check`, tests **89 ข้อ / 8 ไฟล์**, `build` ผ่าน build บน Vercel ผ่านใน 7 วินาที ยังมีคำเตือน JS chunk เกิน 500 kB
- จาก URL จริง: `/`, `/admin` และ deep link ตอบ HTTP 200; ที่ 375×812 หน้า Sign In → เข้าสู่ระบบ → หน้าแรกทำงาน ไม่มีรูปเสีย; `/admin` พาไป Sign In หลังบ้านบน desktop; ไม่มี console error
- ยังไม่ได้ตรวจบน iPhone/Android จริง และ og:image ยังเป็น path relative (`/og-image.png`) จึงยังไม่ได้ทดสอบ LINE preview

## R3–R4 — แอปไรเดอร์ รับงาน + ระหว่างส่ง (#36)

ตรวจเมื่อ 18 พฤศจิกายน 2026 บน `feature/36-rider-jobs` จาก main `58e10fd`

- โค้ด: `lint`, `format:check`, tests **143 ข้อ / 13 ไฟล์**, `build` ผ่านทั้งหมด (ยังมีคำเตือน JS chunk เกิน 500 kB เหมือนเดิม)
- Test ใหม่ (`riderJob.test.js`, `storage.test.js`, `OrdersProvider.test.jsx`): ไรเดอร์ออฟไลน์เดินตามเวลาเหมือนเดิม (test เดิมผ่านโดยไม่แก้) · ไรเดอร์ออนไลน์รอที่ขั้น 1 ตลอด 45 วิ → รับงาน → เลื่อนทีละขั้นถึง 5 · หมดเวลาแล้วกลับไปเดินตามเวลา · ข้ามขั้น/ย้อนขั้น/รับซ้ำ/รับออเดอร์ที่ส่งแล้วหรือยกเลิก ไม่เปลี่ยน · ให้คะแนนได้หลังไรเดอร์ส่งเสร็จ · snapshot ไม่เปลี่ยน · storage เสีย/ถูกบล็อก ถือว่าไรเดอร์ไม่ออนไลน์ · event `storage` จากแท็บอื่น
- **ไม่เปิดแอปไรเดอร์ (ล้าง storage):** สั่ง COD `EH-BKK-261118-00013` ยอด 208.90 ไม่มี `jobOfferExpiresAt` และ C10 ขึ้น "ไปยังร้านค้า" เองหลัง 8 วินาที
- **สองแท็บ (ไรเดอร์ออนไลน์ ปิดรับงานอัตโนมัติ):** สั่ง `00014` → popup งานใหม่เด้งในแท็บไรเดอร์ (นับถอยหลัง, 60 ฿, 3.83 กม., ค่าอาหาร 234.00 ตรงกับค่าอาหารรวมในตะกร้า) · C10 รอที่ "รอรับออเดอร์" → กดรับงาน → C10 เปลี่ยนเป็น "ไปยังร้านค้า" และซ่อนปุ่มข้ามขั้น · รอเกิน 8 วินาทีแล้ว C10 ไม่เดินเอง · ถึงร้านค้าแล้ว → รีเฟรชแท็บไรเดอร์ สถานะยังอยู่ → รับอาหารแล้ว → C10 เปลี่ยนตามทุกขั้น · ยอดรวม/เก็บเงินปลายทาง 208.90 ตรงกับ Checkout
- **ลายเซ็น:** ปุ่ม "ส่งอาหารแล้ว" กดไม่ได้จนกว่าจะเซ็น · วาดด้วยเมาส์ได้ · "ล้าง" ลบภาพและปุ่มกลับเป็นกดไม่ได้ · ใช้คีย์บอร์ดล้วน: Space ติ๊ก "ยืนยันว่าส่งถึงมือลูกค้าแล้ว" → Tab → Enter ส่งได้ → หน้าสรุปรายได้ 60.00 ฿ พร้อมเวลาที่ใช้ → "จบงาน" กลับหน้าแรก ไม่มีการ์ดงานค้าง
- **หลังส่ง:** C10 "จัดส่งเรียบร้อย" เวลาทุกขั้นตรงกับตอนไรเดอร์กด, COD เปลี่ยนเป็นชำระแล้ว, ให้คะแนนไรเดอร์ 5 ดาวได้
- **รับงานอัตโนมัติ:** สั่ง `00015` → รับทันที popup "รับงานใหม่อัตโนมัติแล้ว ✓" + ปุ่มเริ่มงาน · Escape ปิด popup แล้วการ์ด "งานที่กำลังทำ" ยังอยู่ให้กลับเข้างานได้
- **หลังบ้าน A5:** ออเดอร์ล่าสุดแสดง `00015` "ไปยังร้านค้า" (ไรเดอร์ถืออยู่) และ `00014` "จัดส่งเรียบร้อย" ตรงกับ C10
- **แท็บเดียว + หมดเวลา:** สั่ง `00016` แล้วสลับไปแอปไรเดอร์ในแท็บเดิม popup เด้ง · แตะพื้นหลังปิดได้และมีแถบ "มีงานใหม่รอรับ" เปิดกลับได้ · ไม่รับจนครบ 45 วินาที → ออเดอร์ไปขั้น 2 ตามเวลา popup และแถบหายเอง
- **360×740:** popup และหน้า R4 ไม่มี horizontal overflow ปุ่มล่างไม่บังเนื้อหา · desktop แสดงในกรอบโทรศัพท์
- ไม่พบ console error ระหว่าง flow
- ยังไม่ได้ตรวจ: storage ถูกบล็อกจริงใน browser (ตรวจด้วย unit test), อุปกรณ์จริง iPhone/Android (การเซ็นด้วยนิ้ว), เปิดแอปไรเดอร์สองหน้าต่างพร้อมกันที่เปิดรับงานอัตโนมัติทั้งคู่
