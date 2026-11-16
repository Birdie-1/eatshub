# eatsHub: สรุปเอกสารระบบ (Spec Summaries)

สรุปจากเอกสารส่งมอบงาน "โครงการงานพัฒนาแพลตฟอร์มฟู้ดออเดอร์" ของบริษัท ฟู้ด ออเดอรี่ จำกัด (v1.0, ปี 2023) ทั้งหมด 10 ไฟล์ แต่ละไฟล์สรุปไว้ 1 ไฟล์ .md

| ไฟล์สรุป | เอกสารต้นฉบับ | ผู้ใช้ | เกี่ยวกับ Mockup |
|---|---|---|---|
| [01_POS_Module.md](01_POS_Module.md) | 01_FOC_POSModule | แคชเชียร์/ครัวร้านค้า (เว็บ) | อ้างอิงสถานะออเดอร์ |
| [02_Rider_Module.md](02_Rider_Module.md) | 02_FOC_RiderModule | ไรเดอร์ (แอป) | ⭐ ข้อมูลไรเดอร์ + สถานะ |
| [03_Order_Web.md](03_Order_Web.md) | 03_FOC_OrderWeb | ลูกค้า (เว็บ) | ⭐ ฟิลด์ร้าน/เมนู/ออเดอร์ |
| [04_Mobile_Order.md](04_Mobile_Order.md) | 04_FOC_MobileOrder | ลูกค้า (แอป) | ⭐⭐ **flow หลัก**: เลื่อนดูร้าน → เมนู → ตะกร้า → ชำระเงิน → ติดตาม |
| [04b_POS_Mobile_Order_QR_Code.md](04b_POS_Mobile_Order_QR_Code.md) | 04_FOC_MobileOrder_QR Code | ร้านค้า (POS มือถือ + QR โต๊ะ) | ไม่ใช้ |
| [05_Call_Order_Module.md](05_Call_Order_Module.md) | 05_FOC_Call Order Module | Call Center (Odoo CRM + PBX) | ไม่ใช้ |
| [06_Chat_Order.md](06_Chat_Order.md) | 06_FOC_Chat Order | Agent แชท | ไม่ใช้ (ปุ่มแชทลอยเป็นตัวเลือกเสริม) |
| [07a_BOH_Mobile_Restaurant.md](07a_BOH_Mobile_Restaurant.md) | 07_FOC_BOHModule_MobileRestaurant | ร้านค้า (แอป) | อ้างอิงสถานะฝั่งร้าน |
| [07b_BOH_Web_Admin.md](07b_BOH_Web_Admin.md) | 07_FOC_BOHModule_WebAdmin | Admin Platform (เว็บ) | ⭐⭐ **หลังบ้าน: รายชื่อไรเดอร์** |
| [07c_BOH_Web_Restaurant.md](07c_BOH_Web_Restaurant.md) | 07_FOC_BOHModule_WebRestaurant | ร้านค้า (เว็บ) | ไม่ใช้ |

## ภาพรวมแพลตฟอร์ม

```
ลูกค้า ──(Web Ordering / Mobile App / Call Order / Chat Order / QR โต๊ะ)──▶ ออเดอร์
                                                     │
     ร้านค้า (POS · Mobile Store · Web Store) ◀───────┤──▶ ไรเดอร์ (Mobile Rider)
                                                     │
                         Admin Platform (Web Admin) ─┘  ดูแลร้าน ไรเดอร์ ลูกค้า โปรโมชั่น รายงาน
```

- **Stack เดิม:** CakePHP/Bootstrap (เว็บ) · Flutter (แอป 3 ตัว) · PHP POS + MSSQL · MySQL `eatshub` · Odoo (Call Center)
- **ลำดับสถานะออเดอร์ที่ลูกค้าเห็น:** รอรับออเดอร์ → ไปยังร้านค้า → ถึงร้านค้า → ส่งอาหาร → จัดส่งเรียบร้อย · ยกเลิก
- **เลขออเดอร์:** `EH-BKK-YYMMDD-NNNNN` · **รหัสไรเดอร์:** `EA0001`
- **Brand:** สีหลัก `#FCBB18` · sidebar หลังบ้านสีเทาเข้ม (slate) · footer หลังบ้านสีเหลือง
