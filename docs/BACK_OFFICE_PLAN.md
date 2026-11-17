# ระบบหลังบ้าน eatsHub — issues #9–#10

เว็บ responsive ที่ออกแบบสำหรับมือถือเป็นหลัก อ้างอิงข้อกำหนดใน GitHub issues #9–#10 และ `specs/07b_BOH_Web_Admin.md` ข้อมูลไรเดอร์อ้างอิง `specs/02_Rider_Module.md`

## ส่วนที่ทำแล้ว

- รวม `origin/main` ณ commit `d18cdb3` เข้ากับ branch `eatshub_tong` และย้ายงานเดิมเข้า `src/admin/` ตามโครงใหม่
- `/admin/signin`: username `admin`, รหัสผ่านตัวอย่าง, ปุ่มแสดง/ซ่อนรหัสผ่าน, ลืมรหัสผ่านแสดง toast ส่วนกลาง
- ใช้ `useSession()` และ route guard: เข้าหลังบ้านขณะ signed out จะไป login แล้วกลับหน้าที่ตั้งใจจะเข้า; รีเฟรชยังคง session
- Logout จาก header/sidebar ล้างเฉพาะ session แอดมิน แล้วกลับ Landing
- Sidebar ตามลำดับในสเปก มีเมนูย่อยที่พับได้ และเปิดกลุ่มไรเดอร์เป็นค่าเริ่มต้น
- ไรเดอร์ 17 คน ค้นหาแบบทันที เลือกช่องค้นหา กรอง Online/Offline/Delivery/Active/Block เรียงข้อมูล และแบ่งหน้า
- เปลี่ยน Active → Block ต้องกรอกเหตุผล; ยกเลิกไม่เปลี่ยนข้อมูล; ยืนยันแล้วบันทึกเหตุผล ผู้แก้ไข Admin และเวลาปัจจุบันใน state ของหน้า
- เปลี่ยน Block → Active ได้ทันทีและล้างเหตุผลเดิม; รีเฟรชคืนค่า demo records
- ข้อมูล `riders.js` ใช้ schema ตาม #10 พร้อม `DEFAULT_RIDER` (EA00001) สำหรับ #11–#12 และวันที่อิงเวลาที่เปิดใช้งาน
- ต่ำกว่า 1024px แสดงการ์ด ตัวกรองวางซ้อนเต็มความกว้าง และ drawer; ตั้งแต่ 1024px แสดงตารางกับ sidebar

## ขอบเขต

เป็น clickable mockup: ไม่มี API ฐานข้อมูล หรือ authentication จริง การเปลี่ยนสถานะไม่บันทึกถาวร
ฟอร์มเพิ่ม/แก้ไข/ลบ ไรเดอร์ หน้ารายละเอียด กระเป๋าเงิน export และหน้าเมนูอื่นยังอยู่นอกขอบเขต ใช้ `notInScope()` จากส่วนกลาง

## การตรวจสอบ

- `npm run lint`, `npm test`, `npm run build`
- Unit tests สำหรับข้อมูล 17 คน สัดส่วนสถานะ วันที่อิงปัจจุบัน และ DEFAULT_RIDER
- Unit tests ป้องกัน Block โดยไม่มีเหตุผล ตรวจการเปลี่ยนสถานะและ audit fields โดยไม่แก้ข้อมูลต้นฉบับ
- Browser: signed-out guard, login, session หลังรีเฟรช, logout กลับ Landing และ return URL
- Browser: ค้นหาเบอร์โทรไม่มีช่องว่าง, กรองสถานะ, pagination 11–17, เรียงรหัสมากไปน้อย
- Browser: Block ทั้งมือถือ/desktop, บังคับเหตุผลรวมกรณีช่องว่างล้วน, Cancel/Escape, Reactivate, audit fields และ refresh reset
- Browser: เมนูย่อยตั้งค่าเปิดได้ และ unsupported action ปิด drawer พร้อม toast
- Browser: ความกว้าง 360, 390, 768, 1024px ไม่ล้นแนวนอนระดับหน้า; desktop table 1440px
- Smoke check หน้าร้านและรายละเอียดเมนูฝั่งลูกค้าหลังรวม main

## ส่งต่อ

#11–#12 ใช้ `DEFAULT_RIDER` จาก `@/data/riders` โดยไม่สร้างข้อมูลสมชายซ้ำ และควรใช้ component/state ที่อยู่ใน `src/shared/` และ `src/state/` ตาม README
ก่อนรวม production ให้ทำ flow integration และทดสอบอุปกรณ์จริงตาม #13
