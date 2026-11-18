import { useMemo } from 'react'
import { ArrowRight, Bike, Clock3, Percent, Star, Trophy } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import { formatBaht } from '@/shared/lib/format'
import { useRider } from '@/state'
import { PERFORMANCE_DAYS, riderPerformance } from '@/data/riderPerformance'
import RushHourChart from './RushHourChart'

const count = new Intl.NumberFormat('th-TH')
const one = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const two = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const day = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Bangkok',
})
const rankTones = ['bg-brand text-ink', 'bg-neutral-200 text-ink', 'bg-brand-light text-brand-dark']

/** A5: fleet performance over the last 30 days; EA00001 reads the same activity as the rider app. */
export default function RiderPerformance() {
  const { activity, now } = useRider()
  const report = useMemo(() => riderPerformance(activity, now), [activity, now])
  const { summary, top } = report
  const blocked = report.riders.filter((row) => row.riderStatus === 'block').length
  const metrics = [
    {
      label: 'งานส่งสำเร็จ',
      value: count.format(summary.jobs),
      unit: 'งาน',
      note: `รายได้ไรเดอร์รวม ${formatBaht(summary.earning)}`,
      icon: Bike,
      tone: 'bg-success-light text-success',
    },
    {
      label: 'เวลาส่งเฉลี่ย',
      value: one.format(summary.avgMinutes),
      unit: 'นาที',
      note: 'เฉลี่ยตามจำนวนงาน',
      icon: Clock3,
      tone: 'bg-info-light text-info',
    },
    {
      label: 'อัตรารับงาน',
      value: one.format(summary.acceptRate),
      unit: '%',
      note: `รับ ${count.format(summary.jobs)} จาก ${count.format(summary.offered)} งานที่เสนอ`,
      icon: Percent,
      tone: 'bg-brand-light text-brand-dark',
    },
    {
      label: 'คะแนนเฉลี่ย',
      value: two.format(summary.rating),
      unit: '★',
      note: 'เฉลี่ยตามจำนวนงาน',
      icon: Star,
      tone: 'bg-warning-light text-warning',
    },
  ]
  return (
    <section aria-labelledby="rider-performance-title" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-dark">
            <Bike className="size-4" />
            ผลการจัดส่ง
          </p>
          <h2 id="rider-performance-title" className="text-xl font-bold">
            ประสิทธิภาพไรเดอร์ · {PERFORMANCE_DAYS} วันล่าสุด
          </h2>
          <p className="mt-2 text-xs leading-6 text-neutral-500">
            {day.format(report.from)} – {day.format(report.until)} · ไรเดอร์ทั้งหมด {report.riders.length} คน
            รวมบัญชีที่ถูกระงับ
          </p>
        </div>
        <Badge tone="brand">ข้อมูลตัวอย่าง</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, unit, note, icon: Icon, tone }) => (
          <Card key={label} className="min-w-0 border border-neutral-200 shadow-none">
            <span className={`mb-3 inline-flex rounded-xl p-2.5 ${tone}`}>
              <Icon className="size-5" />
            </span>
            <h3 className="text-xs text-neutral-500">{label}</h3>
            <p className="mt-2 text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
              {value}
              <span className="ml-1 text-xs font-normal text-neutral-500">{unit}</span>
            </p>
            <p className="mt-2 text-[10px] leading-5 text-neutral-400">{note}</p>
          </Card>
        ))}
      </div>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card
          as="section"
          aria-labelledby="top-riders-title"
          className="min-w-0 border border-neutral-200/80 shadow-none"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-light text-brand-dark">
              <Trophy className="size-4" />
            </span>
            <div>
              <h3 id="top-riders-title" className="text-sm font-semibold">
                Top 10 ไรเดอร์
              </h3>
              <p className="mt-1 text-[11px] text-neutral-400">เรียงตามจำนวนงาน ถ้าเท่ากันดูคะแนน แล้วจึงดูรหัส</p>
            </div>
          </div>
          <ol className="divide-y divide-neutral-100 lg:hidden">
            {top.map((row) => (
              <li key={row.code} className="py-3 first:pt-0">
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${rankTones[row.rank - 1] ?? 'bg-surface text-neutral-500'}`}
                  >
                    {row.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold leading-6">{row.name}</h4>
                    <p className="text-[11px] text-neutral-500">
                      {row.code} · {row.province}
                    </p>
                  </div>
                </div>
                <dl className="mt-2 ml-11 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:grid-cols-4">
                  {[
                    ['งาน', count.format(row.jobs)],
                    ['รายได้', formatBaht(row.earning)],
                    ['คะแนน', `★ ${one.format(row.rating)}`],
                    ['รับงาน', `${one.format(row.acceptRate)}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-2 sm:block">
                      <dt className="text-neutral-400">{label}</dt>
                      <dd className="font-semibold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
          <table className="hidden w-full text-left text-xs lg:table">
            <caption className="sr-only">Top 10 ไรเดอร์ {PERFORMANCE_DAYS} วันล่าสุด</caption>
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th scope="col" className="py-2 pr-2 font-medium">
                  อันดับ
                </th>
                <th scope="col" className="py-2 pr-2 font-medium">
                  ไรเดอร์
                </th>
                <th scope="col" className="py-2 pr-2 font-medium">
                  จังหวัด
                </th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">
                  งาน
                </th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">
                  รายได้
                </th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">
                  คะแนน
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  อัตรารับงาน
                </th>
              </tr>
            </thead>
            <tbody>
              {top.map((row) => (
                <tr key={row.code} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2.5 pr-2">
                    <span
                      className={`grid size-7 place-items-center rounded-lg font-bold ${rankTones[row.rank - 1] ?? 'bg-surface text-neutral-500'}`}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <th scope="row" className="py-2.5 pr-2 font-normal">
                    <span className="block font-semibold">{row.name}</span>
                    <span className="text-[11px] text-neutral-400">{row.code}</span>
                  </th>
                  <td className="py-2.5 pr-2 text-neutral-600">{row.province}</td>
                  <td className="py-2.5 pr-2 text-right font-semibold tabular-nums">
                    {count.format(row.jobs)}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">{formatBaht(row.earning)}</td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">★ {one.format(row.rating)}</td>
                  <td className="py-2.5 text-right tabular-nums">{one.format(row.acceptRate)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-3 py-3">
            <p className="text-[11px] leading-5 text-neutral-500">
              ไม่จัดอันดับบัญชีที่ถูกระงับ {blocked} คน แต่ยังนับในตัวเลขสรุป
            </p>
            <Button
              to="/admin/riders"
              variant="ghost"
              size="sm"
              className="border border-neutral-200 bg-white"
            >
              จัดการไรเดอร์
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Card>
        <RushHourChart hours={report.hours} peak={report.peak} />
      </div>
      <p className="text-[11px] leading-6 text-neutral-400">
        รายได้ = จำนวนงาน × 60 บาท · ตัวเลขของ {report.riders[0].code} ตรงกับหน้ารายได้ในแอปไรเดอร์ช่วงเดียวกัน
        ไรเดอร์คนอื่นเป็นข้อมูลสมมติ
      </p>
    </section>
  )
}
