# Integration QA — issues #8–#13

ตรวจเมื่อ 17 พฤศจิกายน 2026 บน branch `eatshub_tong` โดยรวม main ถึง `d7354c5` (แก้รูปเมนู #21)
Production: **พักไว้ตามคำสั่งผู้ใช้ ไม่ได้ deploy และไม่ได้ merge เข้า main**

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
- [ ] เลือกบัญชี/ทีม/โปรเจกต์ Vercel และโดเมน
- [ ] ตั้ง og:image เป็น absolute URL ของโดเมนจริง แล้วทดสอบ LINE preview
- [ ] ตรวจ review/merge ของงานใน branch และ production branch main
- [ ] Deploy production และตรวจ deep links จาก URL จริง — **พักไว้ตามคำสั่งผู้ใช้**

ยังไม่ปิด issue #13 เพราะเกณฑ์อุปกรณ์จริงและ production ยังไม่ครบ
