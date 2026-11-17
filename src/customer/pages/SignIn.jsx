import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import Button from '@/shared/components/Button'
import { notInScope } from '@/shared/components/Toast'
import { useSession } from '@/state'

export default function SignIn() {
  const [email, setEmail] = useState('demo@eatshub.app')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef(null)
  const { customerSignedIn, signIn } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from
  const next =
    typeof from === 'string' && from.startsWith('/app') && !from.startsWith('/app/signin') ? from : '/app'
  useEffect(() => () => clearTimeout(timer.current), [])
  if (customerSignedIn) return <Navigate to={next} replace />
  const enter = () => {
    if (!email.trim() || busy) return
    setBusy(true)
    timer.current = setTimeout(() => {
      signIn('customer')
      navigate(next, { replace: true, flushSync: true })
    }, 600)
  }
  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <div className="flex items-center justify-between text-sm">
        <Link to="/" className="min-h-11 py-3 text-neutral-500">
          กลับหน้าหลัก
        </Link>
        <button onClick={notInScope} className="min-h-11 text-brand-dark">
          ลงทะเบียน
        </button>
      </div>
      <div className="mb-8 mt-6 text-center">
        <Logo className="mx-auto size-20 rounded-2xl" />
        <h1 className="mt-5 text-2xl font-bold">อร่อยง่าย ๆ ทุกวัน</h1>
        <p className="mt-2 text-sm text-neutral-500">เข้าสู่ระบบเพื่อเริ่มสั่งอาหารกับ eatsHub</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          enter()
        }}
      >
        <div>
          <label htmlFor="customer-email" className="text-sm font-medium">
            อีเมล
          </label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-neutral-400" />
            <input
              id="customer-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="admin-input pl-11"
            />
          </div>
        </div>
        <div>
          <label htmlFor="customer-password" className="text-sm font-medium">
            รหัสผ่าน
          </label>
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-neutral-400" />
            <input
              id="customer-password"
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
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" defaultChecked className="size-4 accent-brand" />
            จดจำฉัน
          </label>
          <button type="button" onClick={notInScope} className="min-h-11 text-neutral-500">
            ลืมรหัสผ่าน?
          </button>
        </div>
        <Button type="submit" size="lg" block disabled={!email.trim() || busy}>
          {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          <ArrowRight className="size-4" />
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        หรือ
        <span className="h-px flex-1 bg-neutral-200" />
      </div>
      <Button
        variant="ghost"
        block
        className="border border-neutral-200"
        disabled={!email.trim() || busy}
        onClick={enter}
      >
        <span aria-hidden="true" className="text-xl font-bold text-info">
          G
        </span>
        ลงชื่อเข้าใช้ด้วย Google
      </Button>
      <p className="mb-2 mt-6 rounded-xl bg-brand-light p-3 text-center text-xs leading-6 text-neutral-600">
        โหมดสาธิต · ใช้ข้อมูลตัวอย่าง ไม่ตรวจรหัสผ่าน
        <br />
        ไม่มีการเชื่อมต่อบัญชี Google จริง
      </p>
    </div>
  )
}
