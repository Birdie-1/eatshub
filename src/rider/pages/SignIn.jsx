import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import Button from '@/shared/components/Button'
import { riderProfile } from '@/data/riderProfile'
import { useSession } from '@/state'

const APP_VERSION = '3.1.0.1' // shown on the spec's sign-in screen

/** R1 — demo sign-in: the form is prefilled and the password is never checked (same as C1/A1). */
export default function SignIn() {
  const [email, setEmail] = useState(riderProfile.email)
  const [visible, setVisible] = useState(false)
  const { riderSignedIn, signIn } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from
  const next =
    typeof from === 'string' && from.startsWith('/rider') && !from.startsWith('/rider/signin')
      ? from
      : '/rider'
  if (riderSignedIn) return <Navigate to={next} replace />
  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <div className="text-sm">
        <Link to="/" className="inline-block min-h-11 py-3 text-neutral-500">
          กลับหน้าหลัก
        </Link>
      </div>
      <div className="mb-8 mt-6 text-center">
        <Logo className="mx-auto size-20 rounded-2xl" />
        <h1 className="mt-5 text-2xl font-bold">eatsHUB for Rider</h1>
        <p className="mt-2 text-sm text-neutral-500">เข้าสู่ระบบเพื่อเริ่มรับงานส่งอาหาร</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!email.trim()) return
          signIn('rider')
          navigate(next, { replace: true, flushSync: true })
        }}
      >
        <div>
          <label htmlFor="rider-email" className="text-sm font-medium">
            อีเมล
          </label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-neutral-400" />
            <input
              id="rider-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="admin-input pl-11"
            />
          </div>
        </div>
        <div>
          <label htmlFor="rider-password" className="text-sm font-medium">
            รหัสผ่าน
          </label>
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-neutral-400" />
            <input
              id="rider-password"
              type={visible ? 'text' : 'password'}
              defaultValue="demo-password"
              autoComplete="current-password"
              className="admin-input pl-11 pr-12"
            />
            <button
              type="button"
              aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              onClick={() => setVisible(!visible)}
              className="absolute right-0 top-0 grid size-12 place-items-center text-neutral-500"
            >
              {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" block className="mt-2" disabled={!email.trim()}>
          ลงชื่อเข้าใช้งาน
          <ArrowRight className="size-4" />
        </Button>
      </form>
      <p className="mt-6 rounded-xl bg-brand-light p-3 text-center text-xs leading-6 text-neutral-600">
        โหมดสาธิต · ใช้ข้อมูลตัวอย่าง ไม่ตรวจรหัสผ่าน
      </p>
      <p className="mt-auto pt-8 text-center text-xs text-neutral-400">เวอร์ชัน {APP_VERSION}</p>
    </div>
  )
}
