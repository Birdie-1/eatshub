import { useMemo, useState } from 'react'
import SharedBadge from '@/shared/components/Badge'
import { toast } from '@/shared/components/Toast'
import BlockRiderDialog from '@/admin/components/BlockRiderDialog'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  Search,
  X,
} from 'lucide-react'
import { formatRiderDate, createRiders, changeRiderStatus, workLabels } from '@/data/riders'

const tones = {
  online: 'success',
  offline: 'danger',
  delivery: 'warning',
  active: 'success',
  block: 'danger',
}
function Badge({ value }) {
  return (
    <SharedBadge tone={tones[value]}>
      <span className="size-1.5 rounded-full bg-current" />
      {workLabels[value]}
    </SharedBadge>
  )
}
/** Status filter chips: the three work statuses plus blocked accounts; dots match the table badges. */
const statusFilters = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'online', label: 'พร้อมรับงาน', dot: 'bg-status-online' },
  { key: 'delivery', label: 'กำลังจัดส่ง', dot: 'bg-status-delivery' },
  { key: 'offline', label: 'ออฟไลน์', dot: 'bg-status-offline' },
  { key: 'block', label: 'ระงับใช้งาน', blocked: true },
]
/** "20 พ.ย. 2569 08:53" → ["20 พ.ย. 2569", "08:53"] so table dates take two short lines. */
function splitDateTime(iso) {
  const text = formatRiderDate(iso)
  const at = text.lastIndexOf(' ')
  return [text.slice(0, at), text.slice(at + 1)]
}
function RiderStatus({ rider, onChange }) {
  return (
    <select
      aria-label={`สถานะไรเดอร์ ${rider.code}`}
      value={rider.riderStatus}
      onChange={(event) => onChange(rider, event.target.value)}
      className={`min-h-11 w-28 cursor-pointer rounded-xl border border-transparent px-2 text-xs font-semibold outline-none focus:border-brand ${rider.riderStatus === 'active' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}
    >
      <option value="active">Active</option>
      <option value="block">Block</option>
    </select>
  )
}
/** `short` is the table cell under the "เข้าสู่ระบบ" heading, where ใช่ / ไม่ is enough. */
function LoggedIn({ rider, short = false }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`size-1.5 rounded-full ${rider.isLoggedIn ? 'bg-success' : 'bg-neutral-300'}`} />
      {short ? (rider.isLoggedIn ? 'ใช่' : 'ไม่') : rider.isLoggedIn ? 'เข้าสู่ระบบอยู่' : 'ไม่ได้เข้าสู่ระบบ'}
    </span>
  )
}

export default function Riders() {
  const [riders, setRiders] = useState(createRiders)
  const [blocking, setBlocking] = useState(null)
  const requestStatus = (rider, status) => {
    if (status === 'block') setBlocking(rider)
    else updateStatus(rider.code, status, '')
  }
  const updateStatus = (code, status, reason) => {
    setRiders((items) =>
      items.map((rider) => (rider.code === code ? changeRiderStatus(rider, status, reason) : rider)),
    )
    setBlocking(null)
    toast(status === 'block' ? 'ระงับใช้งานไรเดอร์แล้ว' : 'เปิดใช้งานไรเดอร์แล้ว')
  }
  const [query, setQuery] = useState('')
  const [field, setField] = useState('all')
  const [work, setWork] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ field: 'code', direction: 'asc' })
  const counts = useMemo(
    () =>
      Object.keys(workLabels).reduce(
        (all, status) => ({
          ...all,
          [status]: riders.filter((rider) => rider.workStatus === status).length,
        }),
        { block: riders.filter((rider) => rider.riderStatus === 'block').length },
      ),
    [riders],
  )
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('th').replace(/\s/g, '')
    return riders
      .filter((rider) => {
        const fields =
          field === 'all'
            ? [rider.name, rider.code, rider.plate, rider.province, rider.phone]
            : [rider[field]]
        return (
          fields.some((value) => value.toLocaleLowerCase('th').replace(/\s/g, '').includes(term)) &&
          (work === 'all' || rider.workStatus === work || rider.riderStatus === work)
        )
      })
      .sort(
        (a, b) =>
          String(a[sort.field]).localeCompare(String(b[sort.field]), 'th', {
            numeric: true,
          }) * (sort.direction === 'asc' ? 1 : -1),
      )
  }, [riders, query, field, work, sort])
  const pages = Math.max(1, Math.ceil(results.length / pageSize))
  const currentPage = Math.min(page, pages)
  const start = (currentPage - 1) * pageSize
  const visible = results.slice(start, start + pageSize)
  const filtered = query !== '' || work !== 'all' || field !== 'all'
  const filterCount = (key) => (key === 'all' ? riders.length : counts[key])
  const reset = () => {
    setQuery('')
    setField('all')
    setWork('all')
    setPage(1)
  }
  const change = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }
  const changeSort = (key) => {
    setPage(1)
    setSort((previous) => ({
      field: key,
      direction: previous.field === key && previous.direction === 'asc' ? 'desc' : 'asc',
    }))
  }
  const sortHeading = (key, label) => (
    <th
      scope="col"
      aria-sort={sort.field === key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        className="flex min-h-11 items-center gap-2 whitespace-nowrap"
        type="button"
        onClick={() => changeSort(key)}
      >
        {label}
        {sort.field === key ? (
          sort.direction === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 text-neutral-400" />
        )}
      </button>
    </th>
  )

  return (
    <div className="space-y-5 sm:space-y-6">
      <nav aria-label="เส้นทางหน้า" className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span>ระบบหลังบ้าน</span>
        <ChevronRight className="size-3" />
        <span>ไรเดอร์</span>
        <ChevronRight className="size-3" />
        <span className="text-neutral-800" aria-current="page">
          จัดการไรเดอร์
        </span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">จัดการไรเดอร์</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm leading-6 text-neutral-500">
          ดูแลรายชื่อและสถานะไรเดอร์ทั้งหมดของคุณ
          <span className="rounded-md bg-brand-light px-2 py-0.5 text-[11px] text-amber-800">ข้อมูลตัวอย่าง</span>
        </p>
      </div>
      <section
        aria-labelledby="rider-list-title"
        className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white"
      >
        <h2 id="rider-list-title" className="sr-only">
          รายชื่อไรเดอร์
        </h2>
        <div className="space-y-4 p-4 sm:p-5">
          <div
            role="group"
            aria-label="กรองตามสถานะไรเดอร์"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:p-0"
          >
            {statusFilters.map(({ key, label, dot, blocked }) => {
              const active = work === key
              return (
                <button
                  type="button"
                  key={key}
                  aria-pressed={active}
                  onClick={() => {
                    setWork(key)
                    setPage(1)
                  }}
                  className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 text-sm transition-colors ${active ? 'border-brand bg-brand-light font-semibold text-ink' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-ink'}`}
                >
                  {dot && <span className={`size-2 rounded-full ${dot}`} />}
                  {blocked && <Ban className="size-3.5 text-danger" />}
                  {label}
                  <span
                    className={`min-w-6 rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums ${active ? 'bg-brand text-ink' : 'bg-neutral-100 text-neutral-500'}`}
                  >
                    {filterCount(key)}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="rider-search-field">
              ค้นหาจาก
            </label>
            <select
              id="rider-search-field"
              value={field}
              onChange={change(setField)}
              className="admin-input sm:w-44"
            >
              <option value="all">ค้นหาทั้งหมด</option>
              <option value="name">ชื่อไรเดอร์</option>
              <option value="code">รหัสไรเดอร์</option>
              <option value="plate">ทะเบียนรถ</option>
              <option value="phone">เบอร์โทรศัพท์</option>
              <option value="province">จังหวัด</option>
            </select>
            <div className="relative min-w-0 flex-1">
              <label className="sr-only" htmlFor="rider-search">
                ค้นหาไรเดอร์
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-3.5 size-[18px] text-neutral-400" />
              <input
                type="search"
                id="rider-search"
                value={query}
                onChange={change(setQuery)}
                placeholder="ค้นหาชื่อ รหัส ทะเบียน หรือเบอร์โทร"
                className="admin-input pl-11 pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setPage(1)
                  }}
                  aria-label="ล้างคำค้นหา"
                  className="absolute right-0 top-0 grid size-12 place-items-center text-neutral-500"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-neutral-100 bg-neutral-50/70 px-4 py-3 text-xs text-neutral-500 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-3">
            <p role="status" aria-live="polite">
              พบ <strong className="font-semibold text-neutral-800">{results.length}</strong> รายการ
              {filtered && ' จากตัวกรองที่เลือก'}
            </p>
            {filtered && (
              <button
                type="button"
                onClick={reset}
                className="min-h-11 text-neutral-500 underline underline-offset-4 hover:text-ink"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <label htmlFor="rider-mobile-sort">เรียงตาม</label>
            <select
              id="rider-mobile-sort"
              className="min-h-11 rounded-lg border border-neutral-200 bg-white px-2 text-xs text-neutral-700"
              value={`${sort.field}:${sort.direction}`}
              onChange={(event) => {
                const [key, direction] = event.target.value.split(':')
                setSort({ field: key, direction })
                setPage(1)
              }}
            >
              <option value="code:asc">รหัส น้อยไปมาก</option>
              <option value="code:desc">รหัส มากไปน้อย</option>
              <option value="name:asc">ชื่อ ก–ฮ</option>
              <option value="lastActiveAt:desc">ใช้งานล่าสุด</option>
            </select>
          </div>
        </div>
        {visible.length > 0 ? (
          <>
            <div className="divide-y divide-neutral-100 lg:hidden">
              {visible.map((rider) => (
                <article
                  key={rider.code}
                  className={`p-4 sm:p-5 ${rider.riderStatus === 'block' ? 'bg-danger-light/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold tabular-nums text-neutral-500">
                          {rider.code}
                        </span>
                        <Badge value={rider.workStatus} />
                      </p>
                      <h3 className="mt-1.5 font-semibold leading-6">{rider.name}</h3>
                    </div>
                    <RiderStatus rider={rider} onChange={requestStatus} />
                  </div>
                  {rider.riderStatus === 'block' && (
                    <p className="mt-2 text-xs leading-5 text-danger">เหตุผล: {rider.blockReason}</p>
                  )}
                  <ul className="mt-3 space-y-1.5 text-xs text-neutral-600">
                    <li className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0 text-neutral-400" />
                      <span className="tabular-nums">{rider.phone}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-neutral-400" />
                      <span>
                        {rider.plate} · {rider.province}
                      </span>
                    </li>
                    <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Clock3 className="size-3.5 shrink-0 text-neutral-400" />
                      <span>ใช้งานล่าสุด {formatRiderDate(rider.lastActiveAt)}</span>
                      <span className="text-neutral-300">·</span>
                      <LoggedIn rider={rider} />
                    </li>
                  </ul>
                  <details className="mt-1 text-xs text-neutral-500">
                    <summary className="min-h-11 cursor-pointer py-3">ข้อมูลการแก้ไข</summary>
                    <p className="pb-1 leading-6">
                      ผู้แก้ไข: {rider.editedBy} · {formatRiderDate(rider.editedAt)}
                    </p>
                  </details>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="rider-table w-full text-left text-sm">
                <caption className="sr-only">รายชื่อไรเดอร์ พร้อมข้อมูลติดต่อ สถานะ และการใช้งานล่าสุด</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-12">
                      ลำดับ
                    </th>
                    {sortHeading('code', 'รหัสไรเดอร์')}
                    {sortHeading('name', 'ชื่อ / เบอร์โทรศัพท์')}
                    {sortHeading('plate', 'ทะเบียนรถ / จังหวัด')}
                    {sortHeading('lastActiveAt', 'ใช้งานล่าสุด')}
                    <th scope="col" className="whitespace-nowrap">
                      เข้าสู่ระบบ
                    </th>
                    {sortHeading('workStatus', 'สถานะงาน')}
                    {sortHeading('riderStatus', 'สถานะไรเดอร์')}
                    <th scope="col">ผู้แก้ไข / วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((rider, index) => (
                    <tr
                      key={rider.code}
                      className={rider.riderStatus === 'block' ? 'bg-danger-light/40' : undefined}
                    >
                      <td className="text-xs tabular-nums text-neutral-400">{start + index + 1}</td>
                      <td className="font-semibold tabular-nums">{rider.code}</td>
                      <td>
                        <p className="whitespace-nowrap font-semibold">{rider.name}</p>
                        <p className="mt-1 whitespace-nowrap text-xs tabular-nums text-neutral-500">
                          {rider.phone}
                        </p>
                      </td>
                      <td>
                        <p className="font-medium">{rider.plate}</p>
                        <p className="mt-1 whitespace-nowrap text-xs text-neutral-500">{rider.province}</p>
                      </td>
                      <td className="whitespace-nowrap text-xs text-neutral-500">
                        {splitDateTime(rider.lastActiveAt)[0]}
                        <span className="mt-1 block tabular-nums text-neutral-400">
                          {splitDateTime(rider.lastActiveAt)[1]}
                        </span>
                      </td>
                      <td className="text-xs text-neutral-600">
                        <LoggedIn rider={rider} short />
                      </td>
                      <td>
                        <Badge value={rider.workStatus} />
                      </td>
                      <td>
                        <RiderStatus rider={rider} onChange={requestStatus} />
                        {rider.riderStatus === 'block' && (
                          <p
                            className="mt-1 max-w-28 truncate text-[11px] text-danger"
                            title={rider.blockReason}
                          >
                            เหตุผล: {rider.blockReason}
                          </p>
                        )}
                      </td>
                      <td className="min-w-28">
                        <p className="text-xs font-medium">{rider.editedBy}</p>
                        <p className="mt-1 text-[11px] text-neutral-400">{formatRiderDate(rider.editedAt)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Search className="size-7" />
            </span>
            <h3 className="mt-5 font-semibold">ไม่พบไรเดอร์ที่ค้นหา</h3>
            <p className="mt-2 text-sm text-neutral-500">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูทั้งหมด</p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 min-h-11 rounded-xl bg-brand px-5 text-sm font-semibold hover:bg-brand-dark"
            >
              แสดงไรเดอร์ทั้งหมด
            </button>
          </div>
        )}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-100 px-4 py-4 text-xs text-neutral-500 sm:flex-row sm:px-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p>
              แสดง {results.length ? start + 1 : 0} ถึง {Math.min(start + pageSize, results.length)} จาก{' '}
              {results.length} รายการ
            </p>
            <label className="sr-only" htmlFor="rider-page-size">
              จำนวนรายการต่อหน้า
            </label>
            <select
              id="rider-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(1)
              }}
              className="min-h-11 rounded-lg border border-neutral-200 bg-white px-2 text-neutral-700"
            >
              <option value={10}>10 / หน้า</option>
              <option value={5}>5 / หน้า</option>
              <option value={20}>20 / หน้า</option>
            </select>
          </div>
          <nav aria-label="หน้ารายชื่อไรเดอร์" className="flex gap-1">
            <button
              type="button"
              aria-label="หน้าก่อนหน้า"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="admin-page"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                aria-label={`หน้า ${number}`}
                aria-current={currentPage === number ? 'page' : undefined}
                onClick={() => setPage(number)}
                className={`admin-page ${currentPage === number ? 'border-brand bg-brand font-semibold text-neutral-900' : ''}`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              aria-label="หน้าถัดไป"
              disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}
              className="admin-page"
            >
              <ChevronRight className="size-4" />
            </button>
          </nav>
        </div>
      </section>
      {blocking && (
        <BlockRiderDialog
          key={blocking.code}
          rider={blocking}
          onCancel={() => setBlocking(null)}
          onConfirm={(code, reason) => updateStatus(code, 'block', reason)}
        />
      )}
    </div>
  )
}
