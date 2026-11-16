# 06 · Chat Order (คู่มือระบบ)

> สรุปจาก `06_FOC_Chat Order V1.0.pdf` (21 หน้า, คู่มือการใช้งาน v1.0)

## ภาพรวม

ระบบ **แชทซัพพอร์ต/สั่งอาหารผ่านแชท** ลูกค้าทักแชทจาก widget บนเว็บไซต์ (Web Order https://foodordery.co.th/ หัวข้อ "Support Board Chat") แล้วระบบกระจายแชทให้ Agent ที่ออนไลน์อยู่ ทุกแชทที่เข้ามาจะถูกสร้างเป็น **Lead** ใน Call Order (CRM) เพื่อให้ Agent ต่อยอดเป็น Pipeline → เคส หรือ **คำสั่งซื้อ** ได้

- **บทบาท:** **Admin** (ตั้งค่า, สร้าง User, Assign แชท, ดู Report) และ **Agent** (สนทนาได้อย่างเดียว)
- **UI:** 3 คอลัมน์ ได้แก่ รายการสนทนา (Inbox) · หน้าต่างแชท · แผง Details (Conversation ID, Source เช่น Facebook/Web, User type, Creation time, Last activity, Browser, IP, Language, OS, Phone, Department, Agent, Notes)

## เมนูหลัก (Admin)

| # | เมนู | รายละเอียด |
|---|---|---|
| 1 | Conversations | รายการสนทนาทั้งหมด แบ่งเป็น **Inbox** (ยังไม่จบ), **Archive** (จบแล้ว), **Trash** (ลบแล้ว) |
| 2 | User | รายการ Contact/User ทั้งหมด, Group User, Download CSV, ค้นหา, **Add new User** |
| 3 | Setting | ตั้งค่า Chat Order รวมถึงการกระจายแชท (Queue) |
| 4 | Report | แดชบอร์ดข้อมูลแชทที่เข้ามา |
| 5 | Profile User | รูปของ User |

**ปุ่มในหน้าสนทนา:** Archive Conversation (จบการสนทนาและย้ายไป Archive) · Mark as read · Download ประวัติแชท · Delete · แนบไฟล์ · ข้อความตอบกลับสำเร็จรูป · อิโมจิ

## ฟอร์มสร้าง User

Profile image, **Type** (เช่น Agent), First/Last name, Password, Email (ใช้ล็อกอิน), Address, City, Country, Postal code, Phone, Language, Birthdate, Company (เช่น ABPO), Facebook, Twitter, LinkedIn, Website, Timezone

## การกระจายแชท (Setting Queue)

- ระบบกระจายแชทให้ User ที่ **ออนไลน์** โดยรันตามลำดับ User ID
- ตั้งค่าได้: **Active** (เปิดการกระจาย) และ **Concurrent chats** (จำนวนแชทพร้อมกันต่อคน เช่น 2)
- แชทที่เข้ามาเกินโควตาจะรออยู่ในคิวกลาง และระบบจะกระจายอีกครั้งเมื่อมีการจบการสนทนา

## ขั้นตอนการใช้งาน

### 1. การสนทนา
1. ลูกค้าทักแชทผ่าน widget บนเว็บไซต์
2. ระบบกระจายแชทให้ User ที่ออนไลน์ พร้อม popup แจ้งเตือน (เช่น "User #51390")
3. เมื่อลูกค้ากรอกข้อมูลให้ติดต่อกลับ ระบบจะบันทึกเป็นรายชื่อลูกค้า (Profile)
4. Agent สนทนาจนจบแล้วกด ✓ มุมขวาบนเพื่อจบการสนทนา
5. BOT ส่งข้อความขอบคุณพร้อมให้ลูกค้า **Rate and review** (👍/👎)
6. ประวัติแชทย้ายไปที่ Archive

### 2. สร้าง Pipeline จากการสนทนา
1. ทุกแชทจะถูกสร้างเป็น **Lead** ใน Call Order และ assign ให้ Agent ตามที่ map user ไว้ (Manual Assignment)
2. Agent เปิดเมนู Leads → เลือก Lead → กดปุ่มสีน้ำเงิน → popup **Convert to opportunities**
   - Conversion Action: Convert to opportunity
   - Salesperson / Sales Team: ผู้รับผิดชอบ
   - Customer: Create a new customer / Link to an existing customer
3. ระบบสร้าง Pipeline → Agent สร้างเคสหรือสั่งออเดอร์ต่อได้ (ดู [05_Call_Order_Module.md](05_Call_Order_Module.md))

## ความเกี่ยวข้องกับ Mockup

อยู่นอก scope หลัก แต่ถ้าจะเพิ่มความสมจริงให้ mockup ได้ ทำปุ่มแชทลอย ("Hi, Welcome to eatsHUB") บนหน้าติดตามออเดอร์ ซึ่งมีอยู่ใน Order Web/Mobile Order อยู่แล้ว
