import { useMemo, useState } from 'react'
import { Bike, CalendarDays, TrendingUp, Trophy, Wallet } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import { useRider } from '@/state'
import { riderProfile } from '@/data/riderProfile'
import { bangkokDate, recentDays } from '@/data/riderReports'
import { riderEarningsInsights } from '@/data/adminInsights'
import { formatBaht } from '@/shared/lib/format'
import RiderRevenueChart from './RiderRevenueChart'

const dateLabel = (period, month = false) =>
  new Intl.DateTimeFormat('th-TH', {
    day: month ? undefined : 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(`${period}${month ? '-01' : ''}T00:00:00+07:00`))
export default function RiderEarnings() {
  const { activity, now } = useRider()
  const report = useMemo(() => riderEarningsInsights(activity.jobs, now), [activity, now])
  const [date, setDate] = useState(bangkokDate(now))
  const [mode, setMode] = useState('day')
  const day = report.daily.find((row) => row.period === date) ?? { earning: 0, count: 0 }
  const daily = recentDays(`${date}T00:00:00+07:00`, 7).map((period) => ({
    period,
    ...(report.daily.find((row) => row.period === period) ?? { earning: 0, count: 0 }),
    label: dateLabel(period),
    shortLabel: new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Bangkok',
    }).format(new Date(`${period}T00:00:00+07:00`)),
  }))
  const monthly = report.monthly.map((row) => ({
    ...row,
    label: dateLabel(row.period, true),
    shortLabel: new Intl.DateTimeFormat('th-TH', { month: 'short', timeZone: 'Asia/Bangkok' }).format(
      new Date(`${row.period}-01T00:00:00+07:00`),
    ),
  }))
  return (
    <section aria-labelledby="admin-rider-earnings-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-dark">
            <Bike className="size-4" />
            ผลการจัดส่ง
          </p>
          <h2 id="admin-rider-earnings-title" className="text-xl font-bold">
            รายได้ไรเดอร์
          </h2>
          <p className="mt-2 text-xs leading-6 text-neutral-500">
            {riderProfile.name} · {riderProfile.code} · รายได้ค่าส่งที่ส่งสำเร็จ
          </p>
        </div>
        <Badge tone="brand">ไรเดอร์ตัวอย่าง 1 คน</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <p className="text-[11px] leading-6 text-neutral-500">
          ย้อนหลัง 365 วัน · {dateLabel(report.from)} – {dateLabel(report.until)}
          <span className="block">รวมประวัติตัวอย่างและงานที่ส่งเสร็จจากเดโมชุดเดียวกับ R6</span>
        </p>
        <label className="flex items-center gap-2 text-xs font-medium">
          <CalendarDays className="size-4 text-neutral-400" />
          ดูรายวัน
          <input
            type="date"
            aria-label="วันที่รายได้ไรเดอร์"
            value={date}
            min={report.from}
            max={report.until}
            onChange={(event) => {
              if (event.target.value && event.target.validity.valid) setDate(event.target.value)
            }}
            className="min-h-11 min-w-0 rounded-lg border border-neutral-200 bg-white px-2 text-xs"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: 'รายได้รายวัน',
            value: day.earning,
            detail: `${dateLabel(date)} · ${day.count} งาน`,
            icon: Wallet,
            tone: 'bg-success-light text-success',
          },
          {
            label: 'รายได้เดือนนี้',
            value: report.month.earning,
            detail: `${dateLabel(report.month.period, true)} · ${report.month.count} งาน`,
            icon: CalendarDays,
            tone: 'bg-info-light text-info',
          },
          {
            label: 'สูงสุดต่อวัน',
            value: report.peakDay?.earning ?? 0,
            detail: report.peakDay
              ? `${dateLabel(report.peakDay.period)} · ${report.peakDay.count} งาน`
              : 'ยังไม่มีงาน',
            icon: TrendingUp,
            tone: 'bg-brand-light text-brand-dark',
          },
          {
            label: 'สูงสุดต่อเดือน',
            value: report.peakMonth?.earning ?? 0,
            detail: report.peakMonth
              ? `${dateLabel(report.peakMonth.period, true)} · ${report.peakMonth.count} งาน`
              : 'ยังไม่มีงาน',
            icon: Trophy,
            tone: 'bg-admin text-white',
          },
        ].map(({ label, value, detail, icon: Icon, tone }) => (
          <Card key={label} className="min-w-0 border border-neutral-200 shadow-none">
            <span className={`mb-3 inline-flex rounded-xl p-2.5 ${tone}`}>
              <Icon className="size-5" />
            </span>
            <h3 className="text-xs text-neutral-500">{label}</h3>
            <p
              key={value}
              className="insight-enter mt-2 text-xl font-bold tracking-tight tabular-nums sm:text-2xl"
            >
              {formatBaht(value)}
            </p>
            <p className="mt-2 text-[10px] leading-5 text-neutral-400">{detail}</p>
          </Card>
        ))}
      </div>
      <div
        className="flex gap-1 rounded-xl bg-neutral-200/60 p-1 text-xs sm:w-fit"
        role="group"
        aria-label="รูปแบบกราฟรายได้ไรเดอร์"
      >
        {[
          ['day', 'รายวัน · 7 วัน'],
          ['month', 'รายเดือน'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={`min-h-11 flex-1 rounded-lg px-5 font-semibold sm:flex-none ${mode === key ? 'bg-white shadow-sm' : 'text-neutral-500'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <RiderRevenueChart
        key={`${mode}-${date}`}
        rows={mode === 'day' ? daily : monthly}
        label={mode === 'day' ? 'รายได้รายวันย้อนหลัง 7 วัน' : 'รายได้รวมรายเดือนในช่วงประวัติ'}
      />
      <p className="text-[11px] leading-6 text-neutral-400">
        ยอดสูงสุดคำนวณจากยอดรวมในแต่ละวัน/เดือนภายในช่วงประวัติ ไม่ใช่ยอดต่อออเดอร์ และเดือนที่ยังไม่จบรวมเฉพาะงานที่ส่งแล้ว
      </p>
    </section>
  )
}
