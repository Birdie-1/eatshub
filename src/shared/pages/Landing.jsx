import { Link } from 'react-router'
import { LayoutDashboard, Smartphone } from 'lucide-react'
import Logo from '@/shared/components/Logo'

const entries = [
  { to: '/app/signin', label: 'แอปลูกค้า', hint: 'สั่งอาหาร ชำระเงิน ติดตามออเดอร์', icon: Smartphone },
  { to: '/admin/signin', label: 'ระบบหลังบ้าน', hint: 'จัดการรายชื่อไรเดอร์', icon: LayoutDashboard },
]

export default function Landing() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 bg-brand px-4 py-12">
      <div className="flex flex-col items-center gap-3">
        <Logo variant="mark" className="size-28" />
        <h1 className="text-3xl font-bold tracking-tight text-white">eatsHub</h1>
      </div>
      <div className="grid w-full max-w-md gap-3">
        {entries.map(({ to, label, hint, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-dark">
              <Icon className="size-6" />
            </span>
            <span>
              <span className="block text-lg font-semibold">{label}</span>
              <span className="block text-sm text-neutral-500">{hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
