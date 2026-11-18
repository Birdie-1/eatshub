import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatBaht } from '@/shared/lib/format'

export default function RiderRevenueChart({ rows, label }) {
  const [selection, setSelection] = useState(() => rows.at(-1)?.period ?? null)
  const bars = useRef([])
  const index = Math.max(
    0,
    rows.findIndex((row) => row.period === selection),
  )
  const selected = rows[index]
  if (!selected)
    return (
      <section
        aria-label={label}
        className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500"
      >
        ยังไม่มีข้อมูลรายได้ในช่วงนี้
      </section>
    )
  const compact = rows.length > 8
  const max = Math.max(1, ...rows.map((row) => row.earning))
  return (
    <section aria-label={label} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-[10px] text-neutral-400">หน่วย: {compact ? 'พันบาท' : 'บาท'}</span>
      </div>
      <div
        role="group"
        aria-label={`${label} เลือกช่วงเวลา`}
        className="mt-5 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${rows.length},minmax(0,1fr))` }}
      >
        {rows.map((row, i) => (
          <button
            key={row.period}
            type="button"
            ref={(el) => {
              bars.current[i] = el
            }}
            aria-label={`${row.label} ${formatBaht(row.earning)} ${row.count} งาน`}
            aria-pressed={index === i}
            onClick={() => setSelection(row.period)}
            onFocus={() => setSelection(row.period)}
            onKeyDown={(event) => {
              const next =
                event.key === 'ArrowRight'
                  ? Math.min(i + 1, rows.length - 1)
                  : event.key === 'ArrowLeft'
                    ? Math.max(i - 1, 0)
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? rows.length - 1
                        : null
              if (next !== null) {
                event.preventDefault()
                bars.current[next]?.focus()
              }
            }}
            className={`flex h-40 min-w-0 flex-col items-center justify-end rounded-xl px-0.5 pb-2 transition-colors ${index === i ? 'bg-brand-light' : 'hover:bg-surface'}`}
          >
            <span aria-hidden="true" className="mb-2 text-[9px] tabular-nums text-neutral-500">
              {compact ? Number((row.earning / 1000).toFixed(1)) : row.earning.toLocaleString('th-TH')}
            </span>
            <span
              aria-hidden="true"
              className={`w-3/5 rounded-t-md transition-all duration-500 motion-reduce:transition-none ${index === i ? 'bg-brand-dark' : 'bg-brand'}`}
              style={{ height: `${Math.max(2, (row.earning / max) * 104)}px` }}
            />
            <span aria-hidden="true" className="mt-3 whitespace-nowrap text-[9px] text-neutral-500">
              {row.shortLabel}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface p-1">
        <button
          type="button"
          aria-label={`${label} ก่อนหน้า`}
          disabled={index === 0}
          onClick={() => setSelection(rows[index - 1].period)}
          className="grid size-11 shrink-0 place-items-center rounded-lg text-neutral-500 disabled:opacity-25"
        >
          <ChevronLeft className="size-4" />
        </button>
        <output aria-live="polite" className="min-w-0 flex-1 text-center text-xs leading-6">
          <span className="block text-neutral-500">{selected.label}</span>
          <strong key={`${selected.period}-${selected.earning}`} className="insight-enter inline-block">
            {formatBaht(selected.earning)} · {selected.count} งาน
          </strong>
        </output>
        <button
          type="button"
          aria-label={`${label} ถัดไป`}
          disabled={index === rows.length - 1}
          onClick={() => setSelection(rows[index + 1].period)}
          className="grid size-11 shrink-0 place-items-center rounded-lg text-neutral-500 disabled:opacity-25"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <details className="mt-2 text-xs">
        <summary className="min-h-11 cursor-pointer py-3 text-neutral-500 underline underline-offset-4">
          ดูตารางรายได้
        </summary>
        <table className="w-full text-left">
          <caption className="sr-only">{label} ตัวเลขเต็ม</caption>
          <thead>
            <tr>
              <th scope="col" className="py-2">
                ช่วงเวลา
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
            {rows.map((row) => (
              <tr key={row.period} className="border-t border-neutral-100">
                <th scope="row" className="py-2 font-normal">
                  {row.label}
                </th>
                <td className="py-2 text-right">{formatBaht(row.earning)}</td>
                <td className="py-2 text-right">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
