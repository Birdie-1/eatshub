import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/shared/components/Card'
import { monthlyDashboard } from '@/data/dashboard'
import { formatBaht } from '@/shared/lib/format'

const integer = new Intl.NumberFormat('th-TH')
const shortMoney = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 })
const tones = { sales: 'bg-brand', restaurants: 'bg-info', customers: 'bg-success' }

export default function MonthlyChart({ title, series, totalLabel, total }) {
  const [selected, setSelected] = useState(monthlyDashboard.length - 1)
  const bars = useRef([])
  const max = Math.max(1, ...monthlyDashboard.map((row) => row[series]))
  const format = series === 'sales' ? formatBaht : (value) => integer.format(value)
  const unit = series === 'sales' ? 'พันบาท' : series === 'restaurants' ? 'ร้าน (สะสม)' : 'คนใหม่'
  const active = monthlyDashboard[selected]
  const focusMonth = (index) => bars.current[index]?.focus()
  const onKeyDown = (event, index) => {
    let next
    if (event.key === 'ArrowRight') next = Math.min(index + 1, 11)
    if (event.key === 'ArrowLeft') next = Math.max(index - 1, 0)
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = 11
    if (next !== undefined) {
      event.preventDefault()
      focusMonth(next)
    }
  }
  return (
    <Card as="section" className="min-w-0 border border-neutral-200/80 shadow-none" aria-label={title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-[11px] text-neutral-500">หน่วย: {unit}</p>
        </div>
        <span className={`mt-1 size-2.5 shrink-0 rounded-full ${tones[series]}`} />
      </div>
      <p className="mt-4 text-xl font-semibold tabular-nums">
        {format(total)}
        <span className="ml-2 text-xs font-normal text-neutral-500">{totalLabel}</span>
      </p>
      <div role="group" aria-label={`${title} แยกตามเดือน`} className="mt-3 grid grid-cols-12 gap-1">
        {monthlyDashboard.map((row, index) => (
          <button
            key={row.month}
            ref={(element) => {
              bars.current[index] = element
            }}
            type="button"
            aria-label={`${row.name} ${title} ${format(row[series])}`}
            aria-pressed={selected === index}
            onFocus={() => setSelected(index)}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`flex h-44 min-w-0 flex-col items-center justify-end rounded-lg pb-1 outline-offset-2 transition hover:bg-neutral-50 ${selected === index ? 'bg-neutral-50 ring-1 ring-brand/60' : ''}`}
          >
            <span aria-hidden="true" className="mb-1 text-[9px] leading-none tabular-nums text-neutral-600">
              {series === 'sales' ? shortMoney.format(row[series] / 1000) : integer.format(row[series])}
            </span>
            <span
              aria-hidden="true"
              className={`w-3/4 rounded-t-sm ${tones[series]} ${selected === index ? '' : 'opacity-65'}`}
              style={{ height: `${(row[series] / max) * 122}px` }}
            />
            <span aria-hidden="true" className="mt-2 whitespace-nowrap text-[9px] text-neutral-500">
              {row.shortName}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-1 rounded-xl bg-surface px-1 py-1">
        <button
          type="button"
          aria-label={`${title} เดือนก่อนหน้า`}
          disabled={selected === 0}
          onClick={() => setSelected(selected - 1)}
          className="grid size-11 shrink-0 place-items-center rounded-lg text-neutral-500 disabled:opacity-25"
        >
          <ChevronLeft className="size-4" />
        </button>
        <output aria-live="polite" className="min-w-0 flex-1 text-center text-xs leading-5">
          <span className="block text-neutral-500">{active.name}</span>
          <strong className="font-semibold">{format(active[series])}</strong>
        </output>
        <button
          type="button"
          aria-label={`${title} เดือนถัดไป`}
          disabled={selected === 11}
          onClick={() => setSelected(selected + 1)}
          className="grid size-11 shrink-0 place-items-center rounded-lg text-neutral-500 disabled:opacity-25"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <details className="mt-3 text-xs">
        <summary className="min-h-11 cursor-pointer py-3 text-neutral-500 underline underline-offset-4">
          ดูข้อมูลรายเดือน
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
