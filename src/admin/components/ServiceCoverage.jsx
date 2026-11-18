import { useState } from 'react'
import { MapPin, ArrowUpRight } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import {
  coverageMetrics,
  coverageProvinces,
  coverageSource,
  coverageTop,
  provinceShapes,
  provinceNames,
} from '@/data/coverage'

export default function ServiceCoverage() {
  const [selected, setSelected] = useState(coverageTop[0])
  return (
    <Card
      as="section"
      aria-labelledby="coverage-title"
      className="min-w-0 border border-neutral-200/80 shadow-none sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-brand-dark">
            <MapPin className="size-4" />
            พื้นที่ให้บริการในอดีต
          </p>
          <h2 id="coverage-title" className="text-xl font-bold">
            ภาพรวมการให้บริการ
          </h2>
          <p className="mt-2 text-sm text-neutral-500">พฤษภาคม–พฤศจิกายน 2565</p>
        </div>
        <Badge tone="info">ข้อมูลจากข่าวประชาสัมพันธ์</Badge>
      </div>
      <p className="mt-4 max-w-3xl text-xs leading-6 text-neutral-500">
        ข้อมูลผลการดำเนินงาน 7 เดือนแรก แยกจากรายงานตัวอย่างปี 2568 ด้านบน ตัวเลขชุดนี้ไม่ได้รวมเข้ากับยอดของระบบสาธิต
      </p>
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-2xl border border-neutral-100 bg-surface p-3 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">แผนที่ประเทศไทย</h3>
            <span className="text-xs text-neutral-500">19 จังหวัด</span>
          </div>
          <svg
            viewBox="0 0 1051.164 1849.133"
            aria-label="แผนที่จังหวัดที่ให้บริการ eatsHUB พ.ศ. 2565"
            className="mx-auto mt-4 h-auto max-h-[540px] w-full"
            role="group"
          >
            {provinceShapes.map(({ id, d }) => {
              const covered = coverageProvinces.find((p) => p.id === id)
              const province = covered ?? { id, name: provinceNames[id] }
              const label = `${province.name}${province.rank ? ` · อันดับ ${province.rank}` : covered ? ' · ให้บริการ' : ' · ไม่อยู่ในรายชื่อบริการจากข่าว'}`
              return (
                <path
                  key={id}
                  id={`coverage-${id}`}
                  d={d}
                  strokeWidth="1.2"
                  className={`stroke-white focus:outline-none focus:stroke-ink ${covered ? `cursor-pointer transition-colors focus:fill-ink hover:fill-ink ${province.rank ? 'fill-brand-dark' : 'fill-brand'}` : 'cursor-pointer fill-neutral-200 hover:fill-neutral-400 focus:fill-neutral-400'}`}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selected?.id === id}
                  aria-label={label}
                  onFocus={() => setSelected(province)}
                  onMouseEnter={() => setSelected(province)}
                  onClick={() => setSelected(province)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelected(province)
                    }
                  }}
                >
                  <title>{label}</title>
                </path>
              )
            })}
          </svg>
          <p
            role="status"
            aria-live="polite"
            className="mt-3 rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold"
          >
            {selected.name}
            {selected.rank
              ? ` · ใช้งานสูงสุดอันดับ ${selected.rank}`
              : coverageProvinces.some((p) => p.id === selected.id)
                ? ' · ให้บริการ'
                : ' · ไม่อยู่ในรายชื่อบริการจากข่าว'}
          </p>
          <ul
            aria-label="คำอธิบายสีแผนที่"
            className="mt-4 flex flex-wrap justify-center gap-3 text-[11px] text-neutral-600"
          >
            {[
              ['bg-brand', 'จังหวัดที่ให้บริการ'],
              ['bg-brand-dark', 'ใช้งานสูงสุด 3 อันดับ'],
              ['bg-neutral-200', 'จังหวัดอื่น'],
            ].map(([tone, label]) => (
              <li key={label} className="flex items-center gap-1.5">
                <span className={`size-3 rounded ${tone}`} />
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[11px] leading-5 text-neutral-400">
            เลือกจังหวัดบนแผนที่หรือจากรายชื่อเพื่อดูชื่อและอันดับ
          </p>
        </div>
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {coverageMetrics.map((metric) => (
              <div
                key={metric.label}
                className="min-w-0 rounded-2xl border border-brand/30 bg-brand-light/50 p-3 sm:p-4"
              >
                <p className="text-[11px] text-neutral-600">{metric.label}</p>
                <p className="mt-3 whitespace-nowrap text-base font-bold tracking-tight tabular-nums sm:text-2xl">
                  {metric.value}
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">{metric.unit}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">จังหวัดที่มีการใช้งานสูงสุด</h3>
            <ol className="space-y-2">
              {coverageTop.map((province) => (
                <li key={province.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(province)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl bg-brand-light px-3 text-left text-sm"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-brand-dark font-bold text-white">
                      {province.rank}
                    </span>
                    {province.name}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">จังหวัดที่ให้บริการทั้ง 19 จังหวัด</h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {coverageProvinces.map((province) => (
                <li key={province.id}>
                  <button
                    type="button"
                    aria-pressed={selected.id === province.id}
                    onClick={() => setSelected(province)}
                    className={`min-h-11 w-full rounded-lg px-2 py-2 text-left text-xs leading-5 ${selected.id === province.id ? 'bg-brand-light font-semibold text-brand-dark' : 'text-neutral-600 hover:bg-surface'}`}
                  >
                    {province.name}
                    {province.rank ? ` (${province.rank})` : ''}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p className="rounded-xl bg-surface p-3 text-xs leading-6 text-neutral-500">
            ข่าวระบุ 18 จังหวัด แต่จัดชุมพรเป็นอันดับ 1 จึงรวมชุมพรเป็นจังหวัดที่ให้บริการด้วย รวม 19 จังหวัด
            โดยไม่สร้างตัวเลขรายจังหวัดเพิ่มเติม
          </p>
        </div>
      </div>
      <footer className="mt-6 border-t border-neutral-100 pt-4 text-[11px] leading-6 text-neutral-500">
        <a
          href={coverageSource}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline underline-offset-4"
        >
          ที่มา: ข่าวประชาสัมพันธ์ depa / ฟู้ด ออเดอรี่ พฤศจิกายน 2565
          <ArrowUpRight className="size-3" />
        </a>
        <p>
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
        </p>
      </footer>
    </Card>
  )
}
