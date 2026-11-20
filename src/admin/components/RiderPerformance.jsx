import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import { formatBaht } from '@/shared/lib/format'
import { useRider } from '@/state'
import { riderSummary } from '@/data/dashboard'
import { PERFORMANCE_DAYS, riderPerformance } from '@/data/riderPerformance'
import RushHourChart from './RushHourChart'

const TOP = 5
const count = new Intl.NumberFormat('th-TH')
const one = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const two = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const day = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Bangkok',
})
const states = [
  { label: 'พร้อมรับงาน', value: riderSummary.online, tone: 'bg-status-online' },
  { label: 'กำลังจัดส่ง', value: riderSummary.delivery, tone: 'bg-status-delivery' },
  { label: 'ออฟไลน์', value: riderSummary.offline, tone: 'bg-status-offline' },
]

/** A5: live rider states plus fleet performance over the last 30 days; EA00001 reads the rider app's activity. */
export default function RiderPerformance() {
  const { activity, now } = useRider()
  const report = useMemo(() => riderPerformance(activity, now), [activity, now])
  const { summary } = report
  const top = report.top.slice(0, TOP)
  const metrics = [
    {
      label: 'งานส่งสำเร็จ',
      value: count.format(summary.jobs),
      note: `รายได้ไรเดอร์ ${formatBaht(summary.earning)}`,
    },
    { label: 'เวลาส่งเฉลี่ย', value: one.format(summary.avgMinutes), unit: 'นาที', note: 'ต่องาน' },
    {
      label: 'อัตรารับงาน',
      value: one.format(summary.acceptRate),
      unit: '%',
      note: `จาก ${count.format(summary.offered)} งานที่เสนอ`,
    },
    { label: 'คะแนนเฉลี่ย', value: two.format(summary.rating), unit: '/ 5', note: 'ถ่วงตามจำนวนงาน' },
  ]
  return (
    <section aria-labelledby="rider-performance-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rider-performance-title" className="text-lg font-semibold sm:text-xl">
            ไรเดอร์ · {PERFORMANCE_DAYS} วันล่าสุด
          </h2>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
            {day.format(report.from)} – {day.format(report.until)} · ทั้งหมด {report.riders.length} คน
          </p>
        </div>
        <Button to="/admin/riders" variant="ghost" size="sm" className="border border-neutral-200 bg-white">
          จัดการไรเดอร์
          <ArrowRight className="size-4" />
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 lg:grid-cols-4">
        {metrics.map(({ label, value, unit, note }) => (
          <div key={label} className="min-w-0 bg-white p-4 sm:p-5">
            <dt className="text-xs text-neutral-500 sm:text-sm">{label}</dt>
            <dd className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-tight tabular-nums">
              {value}
              {unit && <span className="ml-1 text-sm font-normal text-neutral-500">{unit}</span>}
            </dd>
            <dd className="mt-1.5 text-[11px] leading-5 text-neutral-500 sm:text-xs">{note}</dd>
          </div>
        ))}
      </dl>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-4">
          <Card
            as="section"
            aria-labelledby="rider-status-title"
            className="min-w-0 border border-neutral-200 shadow-none sm:p-6"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 id="rider-status-title" className="font-semibold">
                สถานะตอนนี้
              </h3>
              <span className="text-xs text-neutral-500">{riderSummary.total} คน</span>
            </div>
            <div className="mt-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
              {states.map(({ label, value, tone }) => (
                <span key={label} className={tone} style={{ flexGrow: value }} />
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              {states.map(({ label, value, tone }) => (
                <div key={label} className="min-w-0">
                  <dt className="flex items-center gap-1.5 text-[11px] text-neutral-500 sm:text-xs">
                    <span className={`size-2 shrink-0 rounded-full ${tone}`} />
                    {label}
                  </dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] leading-5 text-neutral-500 sm:text-xs">
              ระงับใช้งาน {riderSummary.blocked} บัญชี (นับรวมใน {riderSummary.total} คนแล้ว)
            </p>
          </Card>
          <Card
            as="section"
            aria-labelledby="top-riders-title"
            className="min-w-0 border border-neutral-200 shadow-none sm:p-6"
          >
            <h3 id="top-riders-title" className="font-semibold">
              ไรเดอร์ดีเด่น {TOP} อันดับ
            </h3>
            <p className="mt-1 text-xs text-neutral-500">เรียงตามจำนวนงาน · ไม่รวมบัญชีที่ถูกระงับ</p>
            <div
              aria-hidden="true"
              className="mt-4 hidden gap-x-3 border-b border-neutral-100 pb-2 text-[11px] text-neutral-400 sm:grid sm:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_4.5rem_4.5rem]"
            >
              <span />
              <span>ไรเดอร์</span>
              <span className="text-right">งาน</span>
              <span className="text-right">คะแนน</span>
              <span className="text-right">รับงาน</span>
            </div>
            <ol className="mt-4 divide-y divide-neutral-100 sm:mt-0">
              {top.map((row) => (
                <li
                  key={row.code}
                  className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0 sm:first:pt-3 sm:grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_4.5rem_4.5rem]"
                >
                  <span
                    className={`grid size-7 place-items-center rounded-lg text-xs font-bold ${row.rank === 1 ? 'bg-brand text-ink' : 'bg-surface text-neutral-500'}`}
                  >
                    {row.rank}
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-medium">{row.name}</h4>
                    <p className="truncate text-[11px] text-neutral-500">
                      {row.code} · {row.province}
                    </p>
                  </div>
                  <p className="text-right text-sm font-semibold tabular-nums">
                    {count.format(row.jobs)}
                    <span className="ml-1 text-[11px] font-normal text-neutral-500 sm:sr-only">งาน</span>
                  </p>
                  <p className="col-start-2 text-[11px] text-neutral-500 tabular-nums sm:col-start-auto sm:text-right sm:text-xs">
                    <span className="sr-only">คะแนน </span>★ {one.format(row.rating)}
                    <span className="sm:hidden"> · รับงาน {one.format(row.acceptRate)}%</span>
                  </p>
                  <p className="hidden text-right text-xs text-neutral-500 tabular-nums sm:block">
                    <span className="sr-only">อัตรารับงาน </span>
                    {one.format(row.acceptRate)}%
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
        <RushHourChart hours={report.hours} peak={report.peak} />
      </div>
      <p className="text-[11px] leading-5 text-neutral-400">
        รายได้ = จำนวนงาน × 60 บาท · ตัวเลขของ {report.riders[0].code} ตรงกับแอปไรเดอร์ ไรเดอร์คนอื่นเป็นข้อมูลสมมติ
      </p>
    </section>
  )
}
