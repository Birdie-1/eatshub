# 05 · Call Order Module (Call Center / CRM)

> สรุปจาก `05_FOC_Call Order Module V1.0.pdf` (141 หน้า, v1.0, 04/07/2023)

## ภาพรวม

ระบบ **Call Center** ให้พนักงาน (Agent) รับสายลูกค้าที่โทรมาสั่งอาหาร แล้วบันทึกคำสั่งซื้อแทนลูกค้า ทำงานร่วมกับ CRM, Helpdesk, แบบสำรวจความพึงพอใจทาง IVR, ระบบโทรศัพท์ PBX, Knowledge Base และรายงาน
- **Tech:** ใช้ **Odoo** เป็นฐาน (CRM/Sales/Helpdesk/Inventory/Employees ฯลฯ) + Telephony (VoIP/SIP) ทั้งหมดรันบน CentOS 7 จำนวน 7 servers (VOIP, Odoo, DB, Report, Realtime Monitor, Webserver, API Gateway)
- **ฐานข้อมูล:** PostgreSQL (Odoo), MySQL, MongoDB · เชื่อมกับ eatsHub DB ผ่าน REST API
- **ช่องทาง:** SIP 5060, HTTPS 443, RTP 10000–20000
- **โมดูลในแผนภาพ:** Inbound/Outbound, IVR, Queue, Voice Record, CDR, CRM, Sales, Survey, Contacts, Calendar, KB System, Dashboard, Employees, Quality Control, Website callorder, Web FAQ, Chat Order
- **UI:** แบบ Odoo backend มี sidebar ไอคอนสีด้านซ้าย, เมนูย่อย, มุมมองข้อมูลสลับได้ (list / kanban / calendar / pivot / bar / line / pie) และโลโก้ eatsHUB

## Workflow

**1. Case manage (Inbound):** ลูกค้าโทรเข้า → ถ้าเป็นลูกค้าใหม่ Agent สร้างข้อมูลรายชื่อ + ที่อยู่จัดส่ง → บันทึกรายการติดต่อ → สร้างเคส (ชื่อเคส, ประเภทเคส, หัวข้อเคส, ทีมที่รับผิดชอบ, SLA, ข้อมูลอื่นๆ) → บันทึกเคส

**2. Order (Inbound):** ลูกค้าโทรเข้า → (ลูกค้าใหม่: สร้างข้อมูลรายชื่อ + ที่อยู่จัดส่ง) → บันทึกรายการติดต่อ → **เลือกร้านค้า → เลือกรายการอาหาร → เลือกค่าจัดส่ง → เลือกโปรโมชั่น → เลือกคูปอง → สรุปรายการสั่งซื้อ** → ลูกค้ายืนยัน → บันทึกคำสั่งซื้อ

## Sitemap (แยกตามบทบาท)

มี 3 บทบาท: **Admin**, **Supervisor**, **Agent** (Agent เห็นเมนูน้อยที่สุด)

| โมดูล | เมนู |
|---|---|
| Discuss / Calendar / Contacts | แชทภายใน, นัดหมาย, รายชื่อผู้ติดต่อ (Tags, Titles, Industries, Localization, Bank Accounts) |
| **CRM** | My Pipeline, My Activities, Leads (Manual Assignment, Automate Configure), Phonecalls, Reporting (Leads, Pipeline, Activities, Pipeline Analysis by Day/Salesperson, Survey Result Analysis, Calls and survey result detail), Configuration (Sales Teams, Activity Types, Pipeline, Resellers, Lead Generation) |
| **PBX** | Active Calls, Calls History, Extensions, Dialplans, Files, Peers, Queues, Routes, Trunks, Users · Report (Incoming/Outgoing Top-10 Users/Partners) · SIP Status, Security, Settings |
| **Sales** | Orders (Quotations, Orders, Sales Teams, Customers), To Invoice, Products (Product Variants, Pricelists, Promotion Programs, Coupon Programs), Reporting, Configuration (Tags, Shipping Methods, Attributes, UoM) |
| **One Hello** | Extension, Trunk, Customer, Billing · รายงาน Inbound (รายวัน/สัปดาห์/เดือน, Abandon Call, by user, by channel) · Outbound |
| **Helpdesk** | Customers, Tickets, SLA (Service Level Agreements, SLA Analysis, SLA Level), Configuration (Stages, Ticket Types, Type of Subject, Teams) |
| อื่นๆ | Requests, Job Queue, Sync Studio, Inventory, **KnowSystem** (Knowledge Base), Quality (Inspections), Surveys, Employees (Directory, Departments, Attendance Check-in/out, Report TimeIn/TimeOut), Dashboards, Settings (Users & Companies, API) |

## หน้าจอหลัก (สรุปจากรูปภาพ 1–121)

| หมวด | หน้าจอ |
|---|---|
| 5.1.1 **CRM** | เข้าสู่ระบบ call order · รายชื่อผู้ติดต่อ (list/kanban) + ฟอร์ม (แท็บที่อยู่เพิ่มเติม, รายการ ticket, ข้อมูลเพิ่มเติม, smart buttons) · ผลการติดต่อ (list/kanban/ฟอร์ม + รายงาน pivot/bar/line/pie แยกพนักงาน/รายวัน, เชื่อมกับ Chat Order) · นัดหมาย (calendar/list) · กระจาย Leads แบบ manual/automate · Leads (list/kanban) · convert lead เป็น opportunity |
| 5.1.2 **คำสั่งซื้อ (Orders)** | Sales Orders (list/kanban/calendar: เลขที่, วันที่, ลูกค้า, Salesperson, ยอดรวม) → ฟอร์มคำสั่งซื้อ (Customer, Invoice/Delivery Address, Order Lines) → **เพิ่มรายการอาหาร** → เลือก variants (เช่น ส้มตำ: เผ็ดมาก/กลาง/ไม่เผ็ด, 40 ฿) → option เสริม (หมูยอ, ข้าวเหนียว, แคปหมู, ไข่เค็ม +10 ฿) → coupon code → ค่าจัดส่ง → รายงาน pivot/bar/line |
| 5.1.3 **Helpdesk Ticket** | kanban / list / calendar + ฟอร์ม ticket + รายงาน |
| 5.1.4 **IVR Survey** | แบบฟอร์มประเมิน (kanban/list), คำถามและคำตอบ, สรุปผล (pie chart, answer data), Survey result analysis by salesperson |
| 5.1.5 **โทรศัพท์ (PBX)** | สายที่กำลังใช้งาน, ประวัติการโทร (list + pivot/bar/line/pie: ANSWERED, BUSY, NO ANSWER, FAILED, CONGESTION) · **หน้าจอโทรศัพท์** (pipeline: New → Follow → Call back → No Contact → Done + softphone ด้านซ้าย, popup สายเข้า, pause call) · รายงาน Inbound/Outbound รายวัน/สัปดาห์/เดือน, Abandon Call · **Inbound monitoring dashboard แบบ real time** (มุมมอง agent / inbound channel / queue) · Voice search (ค้นหาไฟล์เสียง) |
| 5.1.6 **Knowledge Base** | แสดง/จัดการ/ค้นหาองค์ความรู้ |
| 5.1.7 **พนักงาน** | Employee directory (การ์ดรูป: Administrator, Manager, Merchant Support, Payment Support, Call Center Team, Rider Support, agent1–5…), ฟอร์มพนักงาน, รายงานเวลาเข้าออกระบบ |
| 5.1.8 **Dashboard** | Calls History (stacked bar ตามสถานะสาย) + Pipeline ตามพนักงาน |
| FAQ | FAQ backend (หมวดหมู่ + คำถาม) + หน้า FAQ สำหรับ Mobile App (หมวด → รายการ → รายละเอียด) |
| 5.1.10 **Quality Control** | ประเมินคุณภาพการให้บริการทางโทรศัพท์ |

## ER Diagram (รูปภาพ 122–145)

Calendar, Contact, CRM (Lead, Call Phone), PBX (Call History, Extension, Queue, User), Sale (Sale Order, Product, Product Variants, Coupon), One Hello (Extension, Trunk, Customer, Billing), Helpdesk, Inventory, Know System, Survey (Survey, Question, Participations), Employees (Employees, Departments)

## ความเกี่ยวข้องกับ Mockup

อยู่นอก scope หลัก (ไม่มีหน้าจอสำหรับลูกค้า) แต่ใช้เป็นข้อมูลอ้างอิงได้ว่า Platform มีช่องทาง **โทรสั่ง (Call Order)** โดย Agent สั่งแทนลูกค้า และปุ่ม "โทรหา Call Center" ในแอปลูกค้า/ไรเดอร์จะเชื่อมมาที่ระบบนี้
