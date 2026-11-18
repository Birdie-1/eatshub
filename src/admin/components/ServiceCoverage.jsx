import { useRef, useState } from 'react'
import { MapPin, MousePointer2, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import { dashboardYear } from '@/data/dashboard'
import {
  coverageProvinces,
  provinceShapes,
  provinceNames,
  provinceOrderRows,
  provinceOrderTotal,
  provinceOrderReport,
} from '@/data/coverage'

const WIDTH = 1051.164
const HEIGHT = 1849.133
const count = new Intl.NumberFormat('th-TH')
export default function ServiceCoverage() {
  const [selected, setSelected] = useState('th-86')
  const [hover, setHover] = useState(null)
  const [zoom, setZoom] = useState(null)
  const [pulse, setPulse] = useState(null)
  const paths = useRef({})
  const canvas = useRef(null)
  const active = provinceOrderReport(hover?.id ?? selected)
  const select = (id) => {
    const path = paths.current[id]
    if (!path) return
    const box = path.getBBox()
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    setSelected(id)
    setHover(null)
    setPulse((previous) => ({ id, x, y, key: (previous?.key ?? 0) + 1 }))
    setZoom({ x, y, scale: 2 })
  }
  const preview = (id, event) => {
    const rect = canvas.current.getBoundingClientRect()
    const shape = event.currentTarget.getBoundingClientRect()
    const x = event.clientX || shape.x + shape.width / 2
    const y = event.clientY || shape.y + shape.height / 2
    setHover({
      id,
      x: Math.max(8, Math.min(rect.width - 208, x - rect.left + 12)),
      y: Math.max(8, Math.min(rect.height - 112, y - rect.top - 100)),
    })
  }
  const transform = zoom
    ? `translate(${WIDTH / 2 - zoom.x * zoom.scale}px,${HEIGHT / 2 - zoom.y * zoom.scale}px) scale(${zoom.scale})`
    : 'translate(0px,0px) scale(1)'
  return (
    <Card
      as="section"
      aria-labelledby="coverage-title"
      className="coverage-hero min-w-0 overflow-hidden border border-neutral-200/80 shadow-none sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-dark">
            <MapPin className="size-4" />
            ภาพรวมพื้นที่ให้บริการ
          </p>
          <h2 id="coverage-title" className="text-xl font-bold sm:text-2xl">
            ทุกออเดอร์ บนแผนที่เดียว
          </h2>
          <p className="mt-2 text-xs leading-6 text-neutral-500">
            จังหวัดบริการและ Top 3 ตามช่วง พ.ค.–พ.ย. 2565 แยกจากรายงานตัวอย่างปี {dashboardYear + 543} · ชี้เพื่อดูยอด
            คลิกเพื่อสำรวจจังหวัด
          </p>
        </div>
        <Badge tone="brand">
          <Sparkles className="size-3" />
          ยอดรายจังหวัดเป็นข้อมูลสมมติ
        </Badge>
      </div>
      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div
            ref={canvas}
            className="coverage-canvas relative isolate overflow-hidden rounded-2xl border border-neutral-100 bg-surface p-3 sm:p-5"
          >
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold">ประเทศไทย · 19 จังหวัดบริการ (พ.ค.–พ.ย. 2565)</h3>
              <button
                type="button"
                onClick={() => {
                  setZoom(null)
                  setHover(null)
                  setPulse(null)
                }}
                disabled={!zoom}
                className="flex min-h-11 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white/95 px-3 text-[11px] font-medium text-neutral-600 shadow-sm disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" />
                ดูทั้งประเทศ
              </button>
            </div>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="group"
              aria-label="แผนที่ออเดอร์สมมติรายจังหวัด"
              className="relative mx-auto h-auto max-h-[540px] w-full overflow-hidden"
              onPointerLeave={() => setHover(null)}
            >
              <g className="coverage-zoom" style={{ transform }}>
                {provinceShapes.map(({ id, d }) => {
                  const province = provinceOrderReport(id)
                  const covered = coverageProvinces.some((p) => p.id === id)
                  const chosen = id === (hover?.id ?? selected)
                  return (
                    <path
                      key={id}
                      ref={(el) => {
                        paths.current[id] = el
                      }}
                      id={`coverage-${id}`}
                      d={d}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected === id}
                      aria-label={`${provinceNames[id]} ${province.orders} ออเดอร์ ข้อมูลสมมติ${province.rank ? ` อันดับ ${province.rank}` : ''}`}
                      aria-describedby={hover?.id === id ? 'province-map-tooltip' : undefined}
                      strokeWidth={chosen ? 4 : 1.2}
                      className={`coverage-province cursor-pointer stroke-white focus:outline-none ${chosen ? 'fill-admin stroke-brand' : covered ? (province.rank ? 'fill-brand-dark' : 'fill-brand') : 'fill-neutral-200'}`}
                      onPointerEnter={(event) => preview(id, event)}
                      onFocus={(event) => preview(id, event)}
                      onBlur={() => setHover(null)}
                      onClick={() => select(id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          select(id)
                        }
                        if (event.key === 'Escape') {
                          setZoom(null)
                          setHover(null)
                          setPulse(null)
                        }
                      }}
                    >
                      <title>
                        {provinceNames[id]} · {province.orders} ออเดอร์ · ข้อมูลสมมติ
                      </title>
                    </path>
                  )
                })}
                {pulse && (
                  <g key={pulse.key} className="pointer-events-none" aria-hidden="true">
                    <circle
                      cx={pulse.x}
                      cy={pulse.y}
                      r="24"
                      className="coverage-pulse fill-none stroke-brand"
                      strokeWidth="5"
                    />
                    <circle
                      cx={pulse.x}
                      cy={pulse.y}
                      r="9"
                      className="fill-white stroke-brand-dark"
                      strokeWidth="3"
                    />
                  </g>
                )}
              </g>
            </svg>
            {hover && (
              <div
                id="province-map-tooltip"
                role="tooltip"
                className="insight-enter pointer-events-none absolute z-20 w-48 rounded-2xl border border-brand/30 bg-admin px-4 py-3 text-white shadow-xl"
                style={{ left: hover.x, top: hover.y }}
              >
                <p className="text-xs font-semibold">{active.name}</p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums">
                  {count.format(active.orders)}
                  <span className="ml-1 text-[10px] font-normal text-neutral-300">ออเดอร์</span>
                </p>
                <p className="mt-1 text-[10px] text-neutral-300">{active.share}% ของทั้งหมด · ข้อมูลสมมติ</p>
              </div>
            )}
            <div
              className="relative z-10 flex flex-wrap justify-center gap-3 pt-3 text-[10px] text-neutral-500"
              aria-label="คำอธิบายสีแผนที่"
            >
              {[
                ['bg-brand', 'จังหวัดบริการ'],
                ['bg-brand-dark', 'Top 3'],
                ['bg-admin', 'จังหวัดที่เลือก'],
                ['bg-neutral-200', 'จังหวัดอื่น'],
              ].map(([tone, label]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded ${tone}`} />
                  {label}
                </span>
              ))}
            </div>
            <p className="relative z-10 mt-3 flex items-center justify-center gap-1.5 text-[10px] leading-5 text-neutral-400">
              <MousePointer2 className="size-3" />
              แตะหรือกด Enter เพื่อซูม · Escape เพื่อกลับ
            </p>
          </div>
        </div>
        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-admin p-4 text-white">
              <p className="flex items-center gap-2 text-[11px] text-neutral-300">
                <ShoppingBag className="size-4 text-brand" />
                ออเดอร์รวมทุกจังหวัด
              </p>
              <p className="mt-3 text-3xl font-bold tabular-nums">{count.format(provinceOrderTotal)}</p>
              <p className="mt-1 text-[10px] text-neutral-400">ข้อมูลสมมติปี {dashboardYear + 543}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-[11px] text-neutral-500">จังหวัดในชุดตัวอย่าง</p>
              <p className="mt-3 text-3xl font-bold tabular-nums">
                {provinceOrderRows.length}
                <span className="ml-1 text-xs font-normal text-neutral-400">จังหวัด</span>
              </p>
              <p className="mt-1 text-[10px] text-neutral-400">ยอดรวมตรงกับ KPI ออเดอร์</p>
            </div>
          </div>
          <section
            aria-label="รายละเอียดจังหวัดที่เลือก"
            className="overflow-hidden rounded-2xl border border-brand/30 bg-brand-light/50 p-4 sm:p-5"
          >
            <div key={active.id} className="insight-enter">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-brand-dark">จังหวัดที่กำลังสำรวจ</p>
                  <h3 className="mt-1 text-xl font-bold">{active.name}</h3>
                </div>
                <MapPin className="size-5 shrink-0 text-brand-dark" />
              </div>
              <p className="mt-4 text-4xl font-bold tracking-tight tabular-nums">
                {count.format(active.orders)}
                <span className="ml-2 text-xs font-normal text-neutral-500">ออเดอร์</span>
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-brand-dark transition-all duration-700 motion-reduce:transition-none"
                  style={{ width: `${active.share}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                คิดเป็น {active.share}% จาก {provinceOrderTotal} ออเดอร์สมมติ
              </p>
              <p role="status" aria-live="polite" className="sr-only">
                {active.name} {active.orders} ออเดอร์ ข้อมูลสมมติ
              </p>
            </div>
          </section>
          <div>
            <h3 className="mb-2 text-sm font-semibold">สำรวจจังหวัดบริการ</h3>
            <ul className="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-neutral-100 p-1">
              {provinceOrderRows.map((province) => (
                <li key={province.id}>
                  <button
                    type="button"
                    aria-pressed={selected === province.id}
                    onClick={() => select(province.id)}
                    className={`flex min-h-11 w-full items-center justify-between gap-1 rounded-lg px-2 text-left text-[11px] transition-colors ${selected === province.id ? 'bg-brand font-semibold' : 'text-neutral-600 hover:bg-surface'}`}
                  >
                    <span>{province.name}</span>
                    <span className="shrink-0 tabular-nums">{province.orders}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] leading-6 text-neutral-400">
            จำนวนออเดอร์รายจังหวัดเป็นตัวเลขสมมติสำหรับสาธิต ไม่ใช่สถิติจากข่าว และไม่ใช่ออเดอร์สดจากแอปลูกค้า
            จังหวัดนอกชุดตัวอย่างแสดง 0
          </p>
        </div>
      </div>
      <footer className="mt-4 text-[10px] leading-5 text-neutral-400">
        แผนที่: NordNordWest / Paul_012 ·{' '}
        <a
          href="https://commons.wikimedia.org/wiki/File:BlankMap-Thailand-provinces.svg"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Wikimedia Commons
        </a>{' '}
        ·{' '}
        <a
          href="https://creativecommons.org/licenses/by/3.0/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          CC BY 3.0
        </a>{' '}
        · ปรับสีและรวมชิ้นส่วนจังหวัด
      </footer>
    </Card>
  )
}
