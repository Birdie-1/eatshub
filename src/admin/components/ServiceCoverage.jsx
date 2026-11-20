import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Card from '@/shared/components/Card'
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
const ranked = [...provinceOrderRows].sort((a, b) => b.orders - a.orders)
const SHORT_LIST = 6

/** A5 map: 19 service provinces (May–Nov 2022) coloured on Thailand, with fictional 2025 order counts. */
export default function ServiceCoverage() {
  const [selected, setSelected] = useState('th-86')
  const [showAll, setShowAll] = useState(false)
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
  const reset = () => {
    setZoom(null)
    setHover(null)
    setPulse(null)
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
      className="min-w-0 overflow-hidden border border-neutral-200 shadow-none sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="coverage-title" className="font-semibold">
            ออเดอร์แยกตามจังหวัด
          </h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            19 จังหวัดบริการตามข่าว พ.ค.–พ.ย. 2565 · ยอดรายจังหวัดเป็นข้อมูลสมมติ · แตะจังหวัดเพื่อซูม
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={!zoom}
          className="flex min-h-11 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
        >
          <RotateCcw className="size-3.5" />
          ดูทั้งประเทศ
        </button>
      </div>
      <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
        <div
          ref={canvas}
          className="coverage-canvas relative isolate min-w-0 overflow-hidden rounded-2xl bg-surface p-3 sm:p-5"
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="group"
            aria-label="แผนที่ออเดอร์สมมติรายจังหวัด"
            className="relative mx-auto h-auto max-h-[360px] w-full sm:max-h-[460px] overflow-hidden"
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
                      if (event.key === 'Escape') reset()
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
              className="insight-enter pointer-events-none absolute z-20 w-48 rounded-xl bg-admin px-4 py-3 text-white shadow-lg"
              style={{ left: hover.x, top: hover.y }}
            >
              <p className="text-xs font-semibold">{active.name}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {count.format(active.orders)}
                <span className="ml-1 text-[11px] font-normal text-neutral-300">ออเดอร์</span>
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-300">{active.share}% ของทั้งหมด</p>
            </div>
          )}
          <ul
            className="relative z-10 flex flex-wrap justify-center gap-x-3 gap-y-1 pt-3 text-[11px] text-neutral-500"
            aria-label="คำอธิบายสีแผนที่"
          >
            {[
              ['bg-brand', 'จังหวัดบริการ'],
              ['bg-brand-dark', 'Top 3'],
              ['bg-admin', 'ที่เลือก'],
              ['bg-neutral-200', 'จังหวัดอื่น'],
            ].map(([tone, label]) => (
              <li key={label} className="flex items-center gap-1.5">
                <span className={`size-2.5 rounded-sm ${tone}`} />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <div key={active.id} className="insight-enter border-b border-neutral-100 pb-5">
            <p className="text-xs text-neutral-500">{hover ? 'กำลังชี้' : 'จังหวัดที่เลือก'}</p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="text-xl font-semibold">{active.name}</h4>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {count.format(active.orders)}
                <span className="ml-1.5 text-xs font-normal text-neutral-500">ออเดอร์</span>
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
              <div
                className="h-full rounded-full bg-brand-dark transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${active.share}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              {active.share}% จาก {count.format(provinceOrderTotal)} ออเดอร์
            </p>
            <p role="status" aria-live="polite" className="sr-only">
              {active.name} {active.orders} ออเดอร์ ข้อมูลสมมติ
            </p>
          </div>
          <h4 className="mt-5 text-sm font-semibold">จังหวัดที่มีออเดอร์มากที่สุด</h4>
          <ol className="mt-2 space-y-0.5">
            {(showAll ? ranked : ranked.slice(0, SHORT_LIST)).map((province, index) => {
              const chosen = selected === province.id
              return (
                <li key={province.id}>
                  <button
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => select(province.id)}
                    className={`grid min-h-11 w-full grid-cols-[1.25rem_minmax(0,7rem)_minmax(0,1fr)_2.5rem] items-center gap-2 rounded-lg px-2 text-left text-xs transition-colors ${chosen ? 'bg-brand-light font-semibold' : 'text-neutral-600 hover:bg-surface'}`}
                  >
                    <span className="text-neutral-400 tabular-nums">{index + 1}</span>
                    <span className="truncate">{province.name}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
                      <span
                        className={`block h-full rounded-full ${province.rank ? 'bg-brand-dark' : 'bg-brand'}`}
                        style={{ width: `${(province.orders / ranked[0].orders) * 100}%` }}
                      />
                    </span>
                    <span className="text-right tabular-nums">{province.orders}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll(!showAll)}
            className="mt-2 min-h-11 rounded-lg px-2 text-xs font-medium text-neutral-600 underline underline-offset-4 hover:text-ink"
          >
            {showAll ? 'แสดงเฉพาะ 6 อันดับแรก' : `ดูทั้ง ${ranked.length} จังหวัด`}
          </button>
        </div>
      </div>
      <footer className="mt-5 text-[11px] leading-5 text-neutral-400">
        จังหวัดนอกชุดตัวอย่างแสดง 0 · แผนที่: NordNordWest / Paul_012 ·{' '}
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
