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

## A5 / R5–R7 — issues #33, #37, #38

ตรวจ 18 พฤศจิกายน 2026 บน `feature/33-37-38-coverage-rider` เริ่มจากไฟล์ตรงกับ main `643dff3`

- ผ่าน `lint`, `format:check`, tests **123 ข้อ / 13 ไฟล์**, `build` มี Vite warning ขนาด JS หลัก 541.49 kB (gzip 153.92 kB); แผนที่แยก chunk 380.25 kB (gzip 129.57 kB) ไม่มี dependency ใหม่
- Tests ใหม่ 11 ข้อ: SVG ครบ 77 จังหวัด/19 จังหวัดบริการไม่ซ้ำ/Top 3/ค่าข่าว, KPI รายได้รวมจากรายการที่แสดง, ขอบเขตวันในกรุงเทพฯ/เปลี่ยนปี/เดือนอนาคต/ช่วงว่าง, settings และ ledger ร่วม/blocked storage
- Browser emulation 360×800 และ 1440×1000: ไม่มี page overflow ทั้ง A5 และ R5–R7; ปฏิทินรายวันเลื่อนแนวนอนภายในแถวได้ กรอบไรเดอร์บน desktop กว้าง 390px และไม่ล้นภายใน
- A5: path 77 ชิ้น ระบายจังหวัดบริการ 19 (แบรนด์ 16 + Top 3 สีเข้ม); focus/Tab บนแผนที่แสดงชื่อจังหวัดที่มีและไม่มีในรายชื่อข่าวได้ กดรายชื่อเพชรบุรีแสดงอันดับ 2 ค่า 10,000,000+ ไม่ตัดขึ้นบรรทัดใหม่บน 360px; รายงานปี 2025 เดิมไม่เปลี่ยน
- R5: เครดิต 2,520 บาท / เงินสด 1,480 บาท ตรงกับ R2 ในเวลาตรวจ; รออนุมัติ 1,500 บาท; ประวัติรายได้ +60, โบนัส +200, ถอนเงิน − และสถานะอนุมัติแสดงครบ; query `?wallet=cash` และ refresh กลับกระเป๋าเดิมได้
- R6: วันนี้ 18 พ.ย. มี 5 งาน / 300 บาท ตรง R2; เลือก 17 พ.ย. ได้ 8 งาน / 480 บาท / 244 นาที / 29.8 กม.; รายเดือน พ.ย. 119 งาน / 7,140 บาท; ธ.ค. 2569 แสดงขีดและเลือกไม่ได้; ArrowRight และ End ย้ายเดือนและค่าเต็มถูกต้อง ตารางจำนวนเต็มทำงาน; เปลี่ยนปี 2568 เดือน ม.ค. ได้ empty state พร้อม KPI ศูนย์
- R7: ชื่อ EA00001 / คะแนน 4.5 / รถ 9กก9324 กรุงเทพมหานคร ตรงข้อมูลกลาง; หน้าส่วนตัวใช้ 010… และอีเมลสมมติ ธนาคารทั้ง 3 ปิดเลขบางหลัก; เปิดรับงานที่ R2 เปลี่ยนตามใน R7 และรับงานอัตโนมัติที่ R7 เปลี่ยนตาม R2 พร้อมคงค่าหลัง refresh; คืนค่าสวิตช์ก่อนจบการตรวจเป็นเปิดรับงาน=true / รับอัตโนมัติ=false
- Logout ไรเดอร์แล้ว `/rider` ไป `/rider/signin` ขณะที่ `/app` และ `/admin` ยังเข้าได้; ลงชื่อใหม่และกลับ R5 ได้ตาม guard
- สลับแท็บจากรายได้ที่เลื่อนลงมายังบัญชีแล้วเริ่มบนสุด; ไม่พบ browser console error/warning
- ไม่ล้างประวัติ/ตะกร้าเดิมของผู้ใช้ ไม่ทำธุรกรรมจริง ไม่ merge main / deploy production
- งานส่งเสร็จจากออเดอร์ลูกค้าเข้า R6 เป็นข้อเสริมที่ยังรอ #36 (ยังไม่มีสัญญาข้อมูล rider completion ใน main); ไม่บวกงานจากสถานะอัตโนมัติของลูกค้า
- ยังไม่ได้ตรวจบน iPhone/Android จริง
