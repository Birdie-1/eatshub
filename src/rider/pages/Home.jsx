import { CircleUserRound, Star } from 'lucide-react'
import { riderProfile, riderToday } from '@/data/riderProfile'
import { formatBaht } from '@/shared/lib/format'
import { useRider } from '@/state'
import RiderSettings from '@/rider/components/RiderSettings'
import WalletBalances from '@/rider/components/WalletBalances'

// Shared wallet/settings integration for R5/R7; the full map and job-offer home is #35/#36.
export default function Home() {
  const { activity, now } = useRider()
  const today = riderToday(activity, now)
  return (
    <div className="bg-surface px-4 py-5">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-brand-light text-brand-dark">
          <CircleUserRound className="size-8" />
        </span>
        <div>
          <p className="text-xs text-neutral-500">ยินดีต้อนรับ</p>
          <h1 className="mt-1 text-base font-bold">{riderProfile.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
            {riderProfile.code} · <Star className="size-3 fill-brand text-brand" />
            {riderProfile.rating}
          </p>
        </div>
      </header>
      <div className="space-y-5">
        <RiderSettings />
        <WalletBalances links />
        <section className="rounded-2xl bg-admin p-4 text-white">
          <h2 className="text-sm font-semibold">รายได้วันนี้</h2>
          <p className="mt-3 text-3xl font-bold tabular-nums">{formatBaht(today.earning)}</p>
          <p className="mt-2 text-xs text-neutral-300">ส่งสำเร็จ {today.accepted} งาน · ข้อมูลตัวอย่าง</p>
        </section>
      </div>
    </div>
  )
}
