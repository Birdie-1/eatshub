import { Link } from 'react-router'
import { ArrowRight, LayoutDashboard, Smartphone } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import { useSession } from '@/state'

export default function Landing() {
  const { customerSignedIn, adminSignedIn } = useSession()
  const entries = [
    {
      to: customerSignedIn ? '/app' : '/app/signin',
      title: 'แอปลูกค้า',
      hint: 'เลือกร้าน · สั่งอาหาร · ชำระเงิน · ติดตามออเดอร์',
      action: 'เปิดแอปลูกค้า',
      icon: Smartphone,
    },
    {
      to: adminSignedIn ? '/admin/riders' : '/admin/signin',
      title: 'ระบบหลังบ้าน',
      hint: 'รายชื่อไรเดอร์ในระบบ',
      action: 'เปิดระบบหลังบ้าน',
      icon: LayoutDashboard,
    },
  ]
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand px-5 py-12 text-ink">
      <div className="mb-10 text-center">
        <Logo className="mx-auto mb-5 size-24 rounded-3xl shadow-lg" />
        <h1 className="text-4xl font-bold tracking-tight">
          eatsHub<span className="text-white">.</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base">แพลตฟอร์มสั่งอาหารเดลิเวอรี่</p>
      </div>
      <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
        {entries.map(({ to, title, hint, action, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-admin"
          >
            <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand-light text-brand-dark">
              <Icon className="size-7" />
            </span>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mb-6 mt-2 flex-1 text-sm leading-7 text-neutral-500">{hint}</p>
            <span className="flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-sm font-semibold">
              {action}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
      <footer className="mt-10 text-center text-xs leading-6 text-admin">
        Mockup เพื่อการนำเสนอ · ข้อมูลทั้งหมดเป็นข้อมูลจำลอง
        <br />© 2026 EatsHub
      </footer>
    </div>
  )
}
