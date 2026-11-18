import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import Button from '@/shared/components/Button'
import { Toaster, notInScope } from '@/shared/components/Toast'
import { useSession } from '@/state'

// Demo only: no credentials are sent or authenticated.
export default function AdminSignIn() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { adminSignedIn, signIn } = useSession()
  const [username, setUsername] = useState('admin')
  const destination = location.state?.from
  const next =
    typeof destination === 'string' &&
    /^\/admin(?:[/?#]|$)/.test(destination) &&
    !destination.startsWith('/admin/signin')
      ? destination
      : '/admin'
  if (adminSignedIn) return <Navigate to={next} replace />
  return (
    <div className="admin-signin min-h-dvh bg-admin-dark text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="size-10 rounded-xl" />
          <span className="text-xl font-bold">
            eatsHub<span className="text-brand">.</span>
          </span>
        </Link>
        <Link to="/" className="flex min-h-11 items-center gap-2 text-sm text-neutral-300 hover:text-white">
          <ArrowLeft className="size-4" />
          กลับหน้าหลัก
        </Link>
      </header>
      <main className="mx-auto w-full max-w-lg px-5 py-8 sm:py-12">
        <section className="rounded-3xl bg-white p-6 text-neutral-900 shadow-2xl sm:p-9">
          <div className="mb-7">
            <span className="mb-5 inline-flex rounded-xl bg-brand-light p-3 text-brand-dark">
              <LockKeyhole className="size-6" />
            </span>
            <h2 className="text-2xl font-bold">กรุณาเข้าสู่ระบบ</h2>
            <p className="mt-2 text-sm text-neutral-500">ยินดีต้อนรับสู่ระบบหลังบ้าน eatsHub</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (!username.trim()) return
              signIn('admin')
              navigate(next, { replace: true })
            }}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-medium" htmlFor="admin-username">
                ชื่อผู้ใช้
              </label>
              <div className="relative mt-2">
                <UserRound className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-neutral-400" />
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="admin-input pl-11"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="admin-password">
                รหัสผ่าน
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-neutral-400" />
                <input
                  id="admin-password"
                  name="password"
                  type={visible ? 'text' : 'password'}
                  autoComplete="current-password"
                  defaultValue="eatshub-demo"
                  className="admin-input pl-11 pr-12"
                />
                <button
                  type="button"
                  aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                  className="absolute right-0 top-0 grid size-12 place-items-center text-neutral-500"
                >
                  {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={notInScope}
              className="min-h-11 text-sm text-neutral-500 underline underline-offset-4"
            >
              ลืมรหัสผ่าน?
            </button>
            <Button type="submit" size="lg" block disabled={!username.trim()}>
              เข้าสู่ระบบ
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="mt-6 rounded-xl bg-neutral-50 p-3 text-xs leading-6 text-neutral-500">
            โหมดสาธิต · กรอกข้อมูลไว้ให้แล้ว กดเข้าสู่ระบบเพื่อทดลองใช้งานได้ทันที โดยไม่ตรวจสอบรหัสผ่าน
          </p>
        </section>
      </main>
      <footer className="px-5 pb-6 text-center text-xs text-neutral-400">
        © 2026 EatsHub. ระบบจัดการแพลตฟอร์ม
      </footer>
      <Toaster fixed />
    </div>
  )
}
