import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Bell,
  ChevronRight,
  Gift,
  Heart,
  HelpCircle,
  Info,
  KeyRound,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  User,
  UserPlus,
} from 'lucide-react'
import { useCart, useSession } from '@/state'
import TopBar from '@/shared/components/TopBar'
import Card from '@/shared/components/Card'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { notInScope } from '@/shared/components/Toast'

const groups = [
  [
    ['ข้อมูลส่วนตัว', User],
    ['การแจ้งเตือน', Bell],
    ['บันทึกที่อยู่', MapPin],
    ['ร้านค้าที่ถูกใจ', Heart, '/app/account/favorites'],
    ['เปลี่ยนรหัสผ่าน', KeyRound],
    ['คะแนนสะสม', Star],
    ['แนะนำเพื่อน', UserPlus],
  ],
  [
    ['เงื่อนไขและข้อตกลง', ShieldCheck],
    ['เกี่ยวกับเรา', Info],
    ['FAQ', HelpCircle],
    ['โทรหา Call Center', Phone],
  ],
]
export default function Account() {
  const [confirm, setConfirm] = useState(false)
  const { signOut } = useSession()
  const { clear } = useCart()
  const navigate = useNavigate()
  const logout = () => {
    navigate('/', { replace: true, flushSync: true })
    signOut('customer')
    clear()
  }
  return (
    <div className="min-h-full bg-surface">
      <TopBar title="บัญชีของฉัน" backTo="/app" />
      <div className="space-y-4 p-4">
        <Card className="border border-neutral-100 shadow-none">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-light text-brand-dark">
              <User className="size-8" />
            </span>
            <div>
              <h1 className="font-semibold">กรรณิการ์ สุขใจ</h1>
              <p className="mt-1 text-xs text-neutral-500">demo@eatshub.app</p>
              <p className="mt-1 text-xs text-neutral-500">08x-xxx-xxxx</p>
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-brand-light p-3 text-sm">
            <Gift className="size-5 text-brand-dark" />
            คะแนนสะสม <strong className="ml-auto">59</strong>
          </p>
        </Card>
        {groups.map((items, index) => (
          <Card key={index} className="divide-y divide-neutral-100 border border-neutral-100 shadow-none">
            {items.map(([label, Icon, to]) => (
              <button
                key={label}
                onClick={to ? () => navigate(to) : notInScope}
                className="flex min-h-14 w-full items-center gap-3 text-left text-sm"
              >
                <Icon className="size-5 text-neutral-400" />
                {label}
                <ChevronRight className="ml-auto size-4 text-neutral-400" />
              </button>
            ))}
          </Card>
        ))}
        <Card className="border border-neutral-100 shadow-none">
          <button
            onClick={() => setConfirm(true)}
            className="flex min-h-12 w-full items-center gap-3 text-sm text-danger"
          >
            <LogOut className="size-5" />
            ออกจากระบบ
          </button>
        </Card>
        <p className="pb-4 text-center text-xs text-neutral-400">เวอร์ชัน 3.1.0.1</p>
      </div>
      <ConfirmDialog
        open={confirm}
        title="ต้องการออกจากระบบ?"
        confirmLabel="ออกจากระบบ"
        onCancel={() => setConfirm(false)}
        onConfirm={logout}
      >
        ตะกร้าจะถูกล้าง ประวัติคำสั่งซื้อยังอยู่สำหรับการสาธิตรอบถัดไป
      </ConfirmDialog>
    </div>
  )
}
