import { Bike, LayoutDashboard, LogOut } from 'lucide-react'

// Only the screens built in this mockup (A2 dashboard, A3 riders). An entry without `to` is the logout button.
export const adminMenu = [
  { label: 'แดชบอร์ด', to: '/admin', end: true, icon: LayoutDashboard },
  { label: 'จัดการไรเดอร์', to: '/admin/riders', icon: Bike },
  { label: 'ออกจากระบบ', icon: LogOut },
]
