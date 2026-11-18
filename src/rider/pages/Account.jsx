import { Link, useNavigate } from 'react-router'
import { Bike, ChevronRight, CircleUserRound, CreditCard, LogOut, Medal, Star } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import { riderProfile } from '@/data/riderProfile'
import { useSession } from '@/state'
import RiderSettings from '@/rider/components/RiderSettings'

export default function Account() {
  const { signOut } = useSession()
  const navigate = useNavigate()
  const reviews = Object.values(riderProfile.ratingCounts).reduce((sum, n) => sum + n, 0)
  const max = Math.max(...Object.values(riderProfile.ratingCounts))
  return (
    <div className="bg-surface pb-5">
      <header className="border-b border-neutral-100 bg-white px-4 py-5">
        <h1 className="text-lg font-bold">บัญชี</h1>
      </header>
      <div className="space-y-5 px-4 pt-5">
        <Card className="border border-neutral-200 text-center shadow-none">
          <span
            role="img"
            aria-label="รูปโปรไฟล์ไรเดอร์ตัวอย่าง"
            className="mx-auto grid size-20 place-items-center rounded-full bg-brand-light text-brand-dark"
          >
            <CircleUserRound className="size-14" strokeWidth={1.2} />
          </span>
          <h2 className="mt-4 text-lg font-bold">{riderProfile.name}</h2>
          <p className="mt-1 text-xs text-neutral-500">{riderProfile.code}</p>
          <div className="mt-3 flex justify-center">
            <Badge tone="brand">
              <Medal className="size-3.5" />
              พาร์ทเนอร์ {riderProfile.partnerLevel}
            </Badge>
          </div>
          <p className="mt-3 text-[10px] text-neutral-400">โปรไฟล์และข้อมูลทั้งหมดเป็นข้อมูลสมมติ</p>
        </Card>
        <Card
          as="section"
          aria-labelledby="rider-rating-title"
          className="border border-neutral-200 shadow-none"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 id="rider-rating-title" className="text-sm font-semibold">
                คะแนนคนขับ
              </h2>
              <p className="mt-2 text-[11px] text-neutral-500">จาก {reviews} คะแนนตัวอย่าง</p>
            </div>
            <div className="text-right">
              <p className="flex items-center gap-1 text-2xl font-bold">
                <Star className="size-5 fill-brand text-brand" />
                {riderProfile.rating.toFixed(1)}
              </p>
              <p className="text-[10px] text-neutral-400">จาก 5 ดาว</p>
            </div>
          </div>
          <ol className="mt-5 space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => (
              <li key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-10 shrink-0">{stars} ดาว</span>
                <span aria-hidden="true" className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{ width: `${(riderProfile.ratingCounts[stars] / max) * 100}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right tabular-nums text-neutral-500">
                  {riderProfile.ratingCounts[stars]} ครั้ง
                </span>
              </li>
            ))}
          </ol>
        </Card>
        <RiderSettings />
        <section
          aria-label="ข้อมูลบัญชี"
          className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white"
        >
          {[
            ['profile', 'ข้อมูลส่วนตัว', CircleUserRound],
            ['banks', 'บัญชีธนาคาร', CreditCard],
            ['vehicle', 'ยานพาหนะ', Bike],
          ].map(([path, label, Icon]) => (
            <Link
              key={path}
              to={`/rider/account/${path}`}
              className="flex min-h-14 items-center gap-3 px-4 text-sm font-medium"
            >
              <Icon className="size-5 text-neutral-400" />
              {label}
              <ChevronRight className="ml-auto size-4 text-neutral-400" />
            </Link>
          ))}
        </section>
        <button
          type="button"
          onClick={() => {
            navigate('/', { replace: true, flushSync: true })
            signOut('rider')
          }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-white text-sm font-semibold text-danger"
        >
          <LogOut className="size-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  )
}
