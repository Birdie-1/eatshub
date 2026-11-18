import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import Button from '@/shared/components/Button'
import { useSession } from '@/state'

/** R1 — minimal demo sign-in; the full screen (prefilled form, version) is #35. */
export default function SignIn() {
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
      <div className="my-auto text-center">
        <Logo className="mx-auto size-20 rounded-2xl" />
        <h1 className="mt-5 text-2xl font-bold">eatsHUB for Rider</h1>
        <p className="mt-2 text-sm text-neutral-500">เข้าสู่ระบบเพื่อเริ่มรับงานส่งอาหาร</p>
        <Button
          size="lg"
          block
          className="mt-8"
          onClick={() => {
            signIn('rider')
            navigate(next, { replace: true, flushSync: true })
          }}
        >
          ลงชื่อเข้าใช้งาน
          <ArrowRight className="size-4" />
        </Button>
        <p className="mt-6 rounded-xl bg-brand-light p-3 text-xs leading-6 text-neutral-600">
          โหมดสาธิต · ใช้ข้อมูลตัวอย่าง ไม่ตรวจรหัสผ่าน
        </p>
      </div>
    </div>
  )
}
