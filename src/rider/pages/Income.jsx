import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Route, ShoppingBag, Wallet } from 'lucide-react'
import TopBar from '@/shared/components/TopBar'
import Badge from '@/shared/components/Badge'
import { formatBaht } from '@/shared/lib/format'
import { useRider } from '@/state'
import { bangkokDate, bangkokYear, incomeDay, incomeMonths, recentDays } from '@/data/riderReports'

const months = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]
const fullDate = (date) =>
  new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(`${date}T00:00:00+07:00`))
const shortDate = (date) =>
  new Intl.DateTimeFormat('th-TH', { weekday: 'short', timeZone: 'Asia/Bangkok' }).format(
    new Date(`${date}T00:00:00+07:00`),
  )

export default function Income() {
  const { activity, now } = useRider()
  const today = bangkokDate(now)
  const [tab, setTab] = useState('day')
  const [date, setDate] = useState(today)
  const [year, setYear] = useState(bangkokYear(now))
  const [month, setMonth] = useState(Number(today.slice(5, 7)) - 1)
  const [shown, setShown] = useState(20)
  const selectedDay = useRef(null)
  const bars = useRef([])
  const days = recentDays(now)
  const monthly = incomeMonths(activity.jobs, year, now)
  const report = tab === 'day' ? incomeDay(activity.jobs, date, now) : monthly[month]
  const max = Math.max(1, ...monthly.map((row) => row.earning))
  const currentMonth = Number(today.slice(5, 7)) - 1
  const lastMonth = year === bangkokYear(now) ? currentMonth : 11
  const changeTab = (value) => {
    setTab(value)
    setShown(20)
  }
  const chooseMonth = (index) => {
    setMonth(index)
    setShown(20)
  }
  useEffect(() => {
    selectedDay.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [date])
  return (
    <div className="min-w-0 bg-surface pb-5">
      <TopBar title="รายได้" backTo="/rider" />
      <div className="space-y-5 px-4 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">ภาพรวมงานจัดส่งของคุณ</p>
          <Badge tone="brand">ข้อมูลตัวอย่าง</Badge>
        </div>
        <div
          role="tablist"
          aria-label="ช่วงเวลารายได้"
          className="grid grid-cols-2 rounded-xl bg-neutral-200/70 p-1"
        >
          {[
            ['day', 'รายวัน'],
            ['month', 'รายเดือน'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              id={`income-${key}`}
              role="tab"
              aria-selected={tab === key}
              aria-controls="income-report"
              onClick={() => changeTab(key)}
              className={`min-h-11 rounded-lg text-sm font-semibold ${tab === key ? 'bg-white shadow-sm' : 'text-neutral-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'day' ? (
          <section aria-label="เลือกวันรายได้" className="min-w-0">
            <label className="flex items-center justify-between gap-2 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 text-neutral-400" />
                เลือกวันที่
              </span>
              <input
                aria-label="วันที่รายได้"
                type="date"
                value={date}
                min={bangkokDate(activity.jobs.at(-1)?.completedAt ?? now)}
                max={today}
                onChange={(event) => {
                  if (event.target.value && event.target.validity.valid) {
                    setDate(event.target.value)
                    setShown(20)
                  }
                }}
                className="min-h-11 min-w-0 max-w-44 rounded-xl border border-neutral-200 bg-white px-2 text-xs"
              />
            </label>
            <div
              className="mt-3 flex gap-2 overflow-x-auto pb-2"
              role="group"
              aria-label="ปฏิทินรายวัน 30 วันล่าสุด"
            >
              {days.map((day) => (
                <button
                  key={day}
                  ref={day === date ? selectedDay : undefined}
                  type="button"
                  aria-label={fullDate(day)}
                  aria-pressed={day === date}
                  onClick={() => {
                    setDate(day)
                    setShown(20)
                  }}
                  className={`flex min-h-16 w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border text-xs ${date === day ? 'border-brand bg-brand font-semibold' : 'border-neutral-200 bg-white text-neutral-500'}`}
                >
                  <span className="text-[10px]">{shortDate(day)}</span>
                  <span className="text-lg tabular-nums">{Number(day.slice(8))}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section
            aria-label="รายได้รายเดือน"
            className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">รายได้ตลอดปี</h2>
              <select
                aria-label="ปีรายได้"
                value={year}
                onChange={(event) => {
                  setYear(Number(event.target.value))
                  chooseMonth(0)
                }}
                className="min-h-11 rounded-xl border border-neutral-200 px-2 text-xs"
              >
                {[bangkokYear(now), bangkokYear(now) - 1].map((y) => (
                  <option key={y} value={y}>
                    {y + 543}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-[10px] text-neutral-500">หน่วย: พันบาท · เดือนในอนาคตแสดงเป็นขีด</p>
            <div className="mt-3 grid grid-cols-12 gap-0.5">
              {monthly.map((row, index) => (
                <button
                  key={row.month}
                  ref={(el) => {
                    bars.current[index] = el
                  }}
                  type="button"
                  disabled={row.future}
                  aria-label={`${months[index]} ${year + 543} ${row.future ? 'ยังไม่ถึงเดือนนี้' : formatBaht(row.earning)}`}
                  aria-pressed={index === month}
                  onClick={() => chooseMonth(index)}
                  onFocus={() => chooseMonth(index)}
                  onKeyDown={(event) => {
                    const next =
                      event.key === 'ArrowRight'
                        ? Math.min(index + 1, lastMonth)
                        : event.key === 'ArrowLeft'
                          ? Math.max(index - 1, 0)
                          : event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? lastMonth
                              : null
                    if (next !== null) {
                      event.preventDefault()
                      bars.current[next]?.focus()
                    }
                  }}
                  className={`flex h-40 min-w-0 flex-col items-center justify-end rounded-lg pb-1 ${month === index ? 'bg-brand-light ring-1 ring-brand' : ''}`}
                >
                  <span aria-hidden="true" className="mb-1 text-[8px] tabular-nums text-neutral-500">
                    {row.future ? '—' : Number((row.earning / 1000).toFixed(1))}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`w-3/4 rounded-t-sm ${row.future ? 'bg-neutral-100' : 'bg-brand'}`}
                    style={{ height: `${row.future ? 2 : (row.earning / max) * 110}px` }}
                  />
                  <span aria-hidden="true" className="mt-2 whitespace-nowrap text-[8px] text-neutral-500">
                    {months[index]}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface p-1">
              <button
                type="button"
                aria-label="รายได้เดือนก่อนหน้า"
                disabled={month === 0}
                onClick={() => chooseMonth(month - 1)}
                className="grid size-11 place-items-center rounded-lg disabled:opacity-25"
              >
                <ChevronLeft className="size-4" />
              </button>
              <output aria-live="polite" className="text-center text-xs">
                <span className="block text-neutral-500">
                  {months[month]} {year + 543}
                </span>
                <strong>{formatBaht(report.earning)}</strong>
              </output>
              <button
                type="button"
                aria-label="รายได้เดือนถัดไป"
                disabled={month === lastMonth}
                onClick={() => chooseMonth(month + 1)}
                className="grid size-11 place-items-center rounded-lg disabled:opacity-25"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <details className="mt-2 text-xs">
              <summary className="min-h-11 cursor-pointer py-3 text-neutral-500 underline underline-offset-4">
                ดูตัวเลขทั้งปี
              </summary>
              <table className="w-full text-left">
                <caption className="sr-only">รายได้รายเดือนเต็มจำนวน</caption>
                <thead>
                  <tr>
                    <th scope="col" className="py-2">
                      เดือน
                    </th>
                    <th scope="col" className="py-2 text-right">
                      รายได้
                    </th>
                    <th scope="col" className="py-2 text-right">
                      งาน
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((row, index) => (
                    <tr key={row.month} className="border-t border-neutral-100">
                      <th scope="row" className="py-2 font-normal">
                        {months[index]}
                      </th>
                      <td className="py-2 text-right">
                        {row.future ? 'ยังไม่ถึงเดือนนี้' : formatBaht(row.earning)}
                      </td>
                      <td className="py-2 text-right">{row.future ? '—' : row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>
        )}
        <section id="income-report" role="tabpanel" aria-labelledby={`income-${tab}`} className="space-y-4">
          <h2 className="text-sm font-semibold">
            {tab === 'day' ? fullDate(date) : `${months[month]} ${year + 543}`}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['รายได้รวม', formatBaht(report.earning), Wallet, 'bg-brand-light text-brand-dark'],
              ['งานที่สำเร็จ', `${report.count} งาน`, ShoppingBag, 'bg-success-light text-success'],
              [
                'ระยะเวลารวม',
                `${report.minutes.toLocaleString('th-TH')} นาที`,
                Clock3,
                'bg-info-light text-info',
              ],
              [
                'ระยะทางรวม',
                `${report.km.toLocaleString('th-TH')} กม.`,
                Route,
                'bg-neutral-100 text-neutral-600',
              ],
            ].map(([label, value, Icon, tone]) => (
              <div key={label} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-3">
                <span className={`inline-flex rounded-lg p-2 ${tone}`}>
                  <Icon className="size-4" />
                </span>
                <h3 className="mt-3 text-[11px] text-neutral-500">{label}</h3>
                <p className="mt-2 text-lg font-bold tracking-tight tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-semibold">รายการงาน · {report.count} งาน</h3>
            {!report.jobs.length ? (
              <div className="py-10 text-center">
                <ShoppingBag className="mx-auto size-8 text-neutral-300" />
                <p className="mt-3 text-sm font-semibold">ยังไม่มีงานที่ส่งสำเร็จ</p>
                <p className="mt-2 text-xs text-neutral-500">ไม่มีรายได้ในช่วงเวลาที่เลือก</p>
              </div>
            ) : (
              <>
                <ul className="mt-2 divide-y divide-neutral-100">
                  {report.jobs.slice(0, shown).map((job) => (
                    <li key={job.id} className="py-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="break-all text-[11px] font-semibold">{job.id}</p>
                        <strong className="text-sm text-success">{formatBaht(job.earning)}</strong>
                      </div>
                      <p className="mt-1 text-xs text-neutral-600">{job.restaurantName}</p>
                      <p className="mt-2 text-[10px] leading-5 text-neutral-400">
                        {fullDate(bangkokDate(job.completedAt))} · {job.minutes} นาที · {job.km} กม.
                      </p>
                    </li>
                  ))}
                </ul>
                {report.jobs.length > shown && (
                  <button
                    type="button"
                    onClick={() => setShown(shown + 20)}
                    className="min-h-11 w-full rounded-xl border border-neutral-200 text-xs font-semibold"
                  >
                    ดูเพิ่มอีก {Math.min(20, report.jobs.length - shown)} งาน
                  </button>
                )}
              </>
            )}
          </div>
        </section>
        <p className="text-[11px] leading-5 text-neutral-400">รายได้คำนวณจากประวัติงานที่ส่งสำเร็จ งานละ 60 บาท</p>
      </div>
    </div>
  )
}
