import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/shared/components/Card'
import { monthlyDashboard } from '@/data/dashboard'
import { formatBaht } from '@/shared/lib/format'

const integer = new Intl.NumberFormat('th-TH')

/** Twelve-month bar chart for one `monthlyDashboard` series; arrows/Home/End move between months. */
export default function MonthlyChart({ title, series }) {
  const [selected, setSelected] = useState(monthlyDashboard.length - 1)
  const bars = useRef([])
  const values = monthlyDashboard.map((row) => row[series])
  const max = Math.max(1, ...values)
  const peak = monthlyDashboard[values.indexOf(max)]
  const format = series === 'sales' ? formatBaht : (value) => integer.format(value)
  const active = monthlyDashboard[selected]
  const last = monthlyDashboard.length - 1
  const titleId = `monthly-${series}-title`
  const onKeyDown = (event, index) => {
    const next = {
      ArrowRight: Math.min(index + 1, last),
      ArrowLeft: Math.max(index - 1, 0),
      Home: 0,
      End: last,
    }[event.key]
    if (next !== undefined) {
      event.preventDefault()
      bars.current[next]?.focus()
    }
  }
  return (
    <Card
      as="section"
      className="min-w-0 border border-neutral-200 shadow-none sm:p-6"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id={titleId} className="font-semibold">
            {title}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            สูงสุด {peak.name} {format(peak[series])}
          </p>
        </div>
        <div className="flex items-center rounded-xl border border-neutral-200">
          <button
            type="button"
            aria-label={`${title} เดือนก่อนหน้า`}
            disabled={selected === 0}
            onClick={() => setSelected(selected - 1)}
            className="grid size-11 place-items-center rounded-l-xl text-neutral-500 hover:bg-neutral-50 disabled:opacity-25"
          >
            <ChevronLeft className="size-4" />
          </button>
          <output aria-live="polite" className="min-w-24 px-1 text-center text-xs leading-5">
            <span className="block text-neutral-500">{active.name}</span>
            <strong className="font-semibold tabular-nums">{format(active[series])}</strong>
          </output>
          <button
            type="button"
            aria-label={`${title} เดือนถัดไป`}
            disabled={selected === last}
            onClick={() => setSelected(selected + 1)}
            className="grid size-11 place-items-center rounded-r-xl text-neutral-500 hover:bg-neutral-50 disabled:opacity-25"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div
        role="group"
        aria-label={`${title} แยกตามเดือน`}
        className="mt-5 grid grid-cols-12 gap-0.5 sm:gap-1.5"
      >
        {monthlyDashboard.map((row, index) => {
          const chosen = selected === index
          return (
            <button
              key={row.month}
              ref={(element) => {
                bars.current[index] = element
              }}
              type="button"
              aria-label={`${row.name} ${format(row[series])}`}
              aria-pressed={chosen}
              onFocus={() => setSelected(index)}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className="group flex h-52 min-w-0 flex-col items-center justify-end rounded-lg pb-1 sm:h-60"
            >
              <span
                aria-hidden="true"
                className={`w-full max-w-9 rounded-t-md transition-colors ${chosen ? 'bg-brand-dark' : 'bg-brand/55 group-hover:bg-brand'}`}
                style={{ height: `${(row[series] / max) * 100}%` }}
              />
              <span
                aria-hidden="true"
                className={`mt-2 whitespace-nowrap text-[10px] ${chosen ? 'font-semibold text-ink' : 'text-neutral-500'}`}
              >
                {row.shortName}
              </span>
            </button>
          )
        })}
      </div>
      <details className="mt-3 text-xs">
        <summary className="min-h-11 cursor-pointer py-3 text-neutral-500 underline underline-offset-4">
          ดูตัวเลขรายเดือน
        </summary>
        <table className="w-full text-left">
          <caption className="sr-only">{title} จำนวนเต็มทุกเดือน</caption>
          <thead>
            <tr className="border-b border-neutral-200">
              <th scope="col" className="py-2 font-medium">
                เดือน
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                {series === 'sales' ? 'ยอดขาย' : 'จำนวน'}
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlyDashboard.map((row) => (
              <tr key={row.month} className="border-b border-neutral-100">
                <th scope="row" className="py-2 font-normal text-neutral-500">
                  {row.name}
                </th>
                <td className="py-2 text-right tabular-nums">{format(row[series])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  )
}
