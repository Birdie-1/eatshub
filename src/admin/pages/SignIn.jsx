import { Link } from 'react-router'
import Logo from '@/shared/components/Logo'

/** A1 — fake sign-in: fields are prefilled, submit goes straight in (no validation). */
export default function AdminSignIn() {
  return (
    <div className="flex min-h-full items-center justify-center bg-admin px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo className="size-16 rounded-xl" />
          <h1 className="text-lg font-semibold">กรุณาเข้าสู่ระบบ</h1>
        </div>
        <p className="mb-4 text-sm text-neutral-500">A1 · ยังไม่ได้ทำฟอร์ม</p>
        <Link
          to="/admin/riders"
          className="block rounded-lg bg-brand py-2.5 text-center font-semibold hover:bg-brand-dark"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  )
}
