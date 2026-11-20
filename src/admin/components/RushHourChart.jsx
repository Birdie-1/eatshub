import Card from '@/shared/components/Card'
import { PERFORMANCE_DAYS } from '@/data/riderPerformance'

const one = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const count = new Intl.NumberFormat('th-TH')
const clock = (hour) => `${String(hour).padStart(2, '0')}:00`

/** Orders vs online riders per hour (daily averages over the report window), peak window highlighted. */
export default function RushHourChart({ hours, peak }) {
  const rows = hours.map((row) => ({
    ...row,
    ordersPerDay: row.orders / PERFORMANCE_DAYS,
    ridersPerDay: row.riderHours / PERFORMANCE_DAYS,
    perRider: row.riderHours ? row.orders / row.riderHours : 0,
    peak: peak && row.hour >= peak.from && row.hour < peak.to,
  }))
  const max = Math.max(1, ...rows.flatMap((row) => [row.ordersPerDay, row.ridersPerDay]))
  const peakText = peak ? `${clock(peak.from)}–${clock(peak.to)} ออเดอร์ต่อไรเดอร์สูงสุด` : 'ยังไม่มีข้อมูล'
  return (
    <Card
      as="section"
      aria-labelledby="rush-hour-title"
      className="min-w-0 border border-neutral-200 shadow-none sm:p-6"
    >
      <h3 id="rush-hour-title" className="font-semibold">
        ช่วงเวลาเร่งด่วน
      </h3>
      <p className="mt-1 text-xs text-neutral-500">ออเดอร์เทียบไรเดอร์ออนไลน์ เฉลี่ยต่อวัน</p>
      <p className="mt-4 rounded-xl bg-brand-light px-3 py-2.5 text-xs leading-6">
        <strong className="font-semibold">{peakText}</strong>
        {peak && (
          <span className="block text-neutral-600">
            เฉลี่ย {one.format(peak.orders / peak.riderHours)} ออเดอร์ต่อไรเดอร์ต่อชั่วโมง
          </span>
        )}
      </p>
      <div
        role="img"
        aria-label={`กราฟออเดอร์และไรเดอร์ออนไลน์รายชั่วโมง ${clock(rows[0].hour)}–${clock(rows.at(-1).hour + 1)} · ${peakText}`}
        className="mt-4 grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${rows.length},minmax(0,1fr))` }}
      >
        {rows.map((row) => (
          <div
            key={row.hour}
            className={`flex min-w-0 flex-col items-center rounded-lg pt-2 pb-1 ${row.peak ? 'bg-brand-light' : ''}`}
          >
            <div className="flex h-40 w-full items-end justify-center gap-px">
              <span
                className={`w-2/5 max-w-3 rounded-t-sm ${row.peak ? 'bg-brand-dark' : 'bg-brand'}`}
                style={{ height: `${(row.ordersPerDay / max) * 100}%` }}
              />
              <span
                className="w-1/4 max-w-2 rounded-t-sm bg-info/70"
                style={{ height: `${(row.ridersPerDay / max) * 100}%` }}
              />
            </div>
            <span className="mt-1.5 text-[10px] tabular-nums text-neutral-500">{row.hour}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded bg-brand" />
          ออเดอร์ต่อวัน
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded bg-info/70" />
          ไรเดอร์ออนไลน์ต่อวัน
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded bg-brand-dark" />
          ช่วงที่ออเดอร์ต่อไรเดอร์สูงสุด
        </span>
      </div>
      <details className="mt-3 text-xs">
        <summary className="min-h-11 cursor-pointer py-3 text-neutral-500 underline underline-offset-4">
          ดูข้อมูลรายชั่วโมง
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full min-w-72 text-left">
            <caption className="sr-only">ออเดอร์และไรเดอร์ออนไลน์รายชั่วโมง {PERFORMANCE_DAYS} วันล่าสุด</caption>
            <thead>
              <tr className="border-b border-neutral-200">
                <th scope="col" className="py-2 font-medium">
                  ชั่วโมง
                </th>
                <th scope="col" className="py-2 pl-3 text-right font-medium">
                  ออเดอร์รวม
                </th>
                <th scope="col" className="py-2 pl-3 text-right font-medium">
                  ออเดอร์/วัน
                </th>
                <th scope="col" className="py-2 pl-3 text-right font-medium">
                  ไรเดอร์/วัน
                </th>
                <th scope="col" className="py-2 pl-3 text-right font-medium">
                  ต่อไรเดอร์
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.hour}
                  className={`border-b border-neutral-100 ${row.peak ? 'font-semibold' : ''}`}
                >
                  <th scope="row" className="py-2 font-normal whitespace-nowrap text-neutral-500">
                    {clock(row.hour)}–{clock(row.hour + 1)}
                  </th>
                  <td className="py-2 pl-3 text-right tabular-nums">{count.format(row.orders)}</td>
                  <td className="py-2 pl-3 text-right tabular-nums">{one.format(row.ordersPerDay)}</td>
                  <td className="py-2 pl-3 text-right tabular-nums">{one.format(row.ridersPerDay)}</td>
                  <td className="py-2 pl-3 text-right tabular-nums">{one.format(row.perRider)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  )
}
