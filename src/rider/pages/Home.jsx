import { Link } from 'react-router'
import { Banknote, ChevronRight, CreditCard, Navigation, Zap } from 'lucide-react'
import mapImage from '@/shared/assets/images/rider-map.svg'
import Card from '@/shared/components/Card'
import { formatBaht } from '@/shared/lib/format'
import { riderProfile } from '@/data/riderProfile'
import { useRiderStatus } from '@/state'
import Switch from '@/rider/components/Switch'
import StatsSheet from '@/rider/components/StatsSheet'
import { useRiderSummary } from '@/rider/useRiderSummary'

function Stat({ label, value }) {
  return (
    <div className="flex flex-col-reverse rounded-2xl bg-surface px-2 py-3 text-center">
      <dt className="mt-0.5 text-xs text-neutral-500">{label}</dt>
      <dd className="text-lg font-bold">{value}</dd>
    </div>
  )
}

/** R2 — rider home: online switch over a static map, wallet balances, auto-accept and a stats sheet. */
export default function Home() {
  const { online, autoAccept, setOnline, setAutoAccept } = useRiderStatus()
  const { today, acceptRate, credit, cash } = useRiderSummary()
  const wallets = [
    { label: 'ยอดเครดิต', amount: credit.balance, icon: CreditCard },
    { label: 'กระเป๋าเงินสด', amount: cash.balance, icon: Banknote },
  ]
  return (
    <div className="relative flex h-full min-h-[600px] flex-col overflow-hidden bg-surface">
      <img
        src={mapImage}
        alt=""
        className={`absolute inset-0 size-full object-cover transition ${online ? '' : 'opacity-60 grayscale'}`}
      />
      <div
        role="img"
        aria-label="ตำแหน่งปัจจุบันของคุณ"
        className="absolute left-1/2 top-[52%] grid -translate-x-1/2 -translate-y-1/2 place-items-center"
      >
        {online && <span className="absolute size-16 rounded-full bg-brand/40 motion-safe:animate-ping" />}
        <span
          className={`relative grid size-11 place-items-center rounded-full border-4 border-white shadow-lg ${online ? 'bg-brand text-ink' : 'bg-neutral-400 text-white'}`}
        >
          <Navigation className="size-5 fill-current" />
        </span>
      </div>

      <div className="relative z-10 space-y-3 p-4">
        <Card className="flex items-center gap-3 py-2 pr-2">
          <span
            aria-hidden="true"
            className={`size-3 shrink-0 rounded-full ${online ? 'bg-success' : 'bg-neutral-400'}`}
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold">{online ? 'คุณกำลังออนไลน์อยู่' : 'คุณออฟไลน์อยู่'}</h1>
            <p className="text-xs text-neutral-500">{online ? 'พร้อมรับงานใหม่' : 'เปิดสวิตช์เพื่อเริ่มรับงาน'}</p>
          </div>
          <Switch checked={online} onChange={setOnline} label="ออนไลน์รับงาน" />
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {wallets.map(({ label, amount, icon: Icon }) => (
            <Card
              key={label}
              as={Link}
              to="/rider/wallet"
              className="block transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin"
            >
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Icon className="size-4 text-brand-dark" />
                {label}
                <ChevronRight className="ml-auto size-4" />
              </span>
              <span className="mt-1 block text-lg font-bold">{formatBaht(amount)}</span>
            </Card>
          ))}
        </div>

        <Card className="flex items-center gap-3 py-2 pr-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-dark">
            <Zap className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">รับงานอัตโนมัติ</p>
            <p className="text-xs text-neutral-500">{autoAccept ? 'เปิดอยู่' : 'ปิดอยู่'}</p>
          </div>
          <Switch checked={autoAccept} onChange={setAutoAccept} label="รับงานอัตโนมัติ" />
        </Card>
      </div>

      {/* R3 (#36): while online, the new-job popup opens over this screen. */}

      <StatsSheet
        title="ข้อมูลของฉัน"
        peek={`รายได้วันนี้ ${formatBaht(today.earning)} · รับงาน ${today.accepted} งาน`}
      >
        <h2 className="mb-2 text-sm font-semibold text-neutral-500">ข้อมูลสะสม</h2>
        <dl className="grid grid-cols-3 gap-2">
          <Stat label="ระดับพาร์ทเนอร์" value={riderProfile.partnerLevel} />
          <Stat label="คะแนน" value={`⭐ ${riderProfile.rating}`} />
          <Stat label="อัตรารับงาน" value={`${acceptRate.toFixed(2)}%`} />
        </dl>
        <h2 className="mb-2 mt-5 text-sm font-semibold text-neutral-500">ข้อมูลวันนี้</h2>
        <dl className="grid grid-cols-3 gap-2">
          <Stat label="รายได้วันนี้" value={formatBaht(today.earning)} />
          <Stat label="งานเข้า" value={today.offered} />
          <Stat label="งานที่รับ" value={today.accepted} />
        </dl>
      </StatsSheet>
    </div>
  )
}
