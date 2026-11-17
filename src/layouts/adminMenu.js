import {
  BarChart3,
  Bike,
  ClipboardList,
  Gift,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  Store,
  Tags,
  Ticket,
  Users,
} from 'lucide-react'

/**
 * Back-office sidebar, per docs/specs/07b_BOH_Web_Admin.md sitemap.
 * Only items with `to` are in mockup scope; the rest show a "not in scope" toast (A4).
 */
export const adminMenu = [
  { label: 'แดชบอร์ด', icon: LayoutDashboard },
  { label: 'ผู้ดูแลระบบย่อย', icon: ShieldCheck },
  { label: 'ไรเดอร์', icon: Bike, to: '/admin/riders' },
  { label: 'ร้านอาหาร', icon: Store },
  { label: 'หมวดหมู่อาหาร', icon: Tags },
  { label: 'คำสั่งซื้อ', icon: ClipboardList },
  { label: 'คูปองส่วนลด', icon: Ticket },
  { label: 'คะแนนสะสม', icon: Gift },
  { label: 'ลูกค้า', icon: Users },
  { label: 'สถานที่', icon: MapPin },
  { label: 'รายงาน', icon: BarChart3 },
  { label: 'ตั้งค่า', icon: Settings },
]
