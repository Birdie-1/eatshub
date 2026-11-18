import { useMemo, useState } from 'react'
import SharedBadge from '@/shared/components/Badge'
import { toast } from '@/shared/components/Toast'
import BlockRiderDialog from '@/admin/components/BlockRiderDialog'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bike,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Filter,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Smartphone,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { accountLabels, formatRiderDate, createRiders, changeRiderStatus, workLabels } from '@/data/riders'

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
function Avatar({ small = false }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl bg-brand-light text-brand-dark ${small ? 'size-10' : 'size-12'}`}
    >
      <Bike className={small ? 'size-5' : 'size-6'} strokeWidth={1.6} />
    </span>
  )
}
function RiderStatus({ rider, onChange }) {
  return (
    <div className="max-w-48">
      <select
        aria-label={`สถานะไรเดอร์ ${rider.code}`}
        value={rider.riderStatus}
        onChange={(event) => onChange(rider, event.target.value)}
        className={`min-h-11 w-full min-w-24 cursor-pointer rounded-xl border border-transparent px-2 text-xs font-semibold outline-none focus:border-brand ${rider.riderStatus === 'active' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}
      >
        <option value="active">Active</option>
        <option value="block">Block</option>
      </select>
      {rider.riderStatus === 'block' && (
        <p className="mt-1 break-words text-[11px] leading-5 text-danger">เหตุผล: {rider.blockReason}</p>
      )}
    </div>
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
        {},
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-brand" />
            <span className="text-xs font-medium text-neutral-500">เครือข่ายการจัดส่ง</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">จัดการไรเดอร์</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">ดูแลรายชื่อและสถานะไรเดอร์ทั้งหมดของคุณ</p>
        </div>
      </div>
      <section aria-label="ภาพรวมไรเดอร์" className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {[
          {
            key: 'all',
            label: 'ไรเดอร์ทั้งหมด',
            number: riders.length,
            icon: Users,
            tone: 'bg-brand-light text-brand-dark',
          },
          {
            key: 'online',
            label: 'พร้อมรับงาน',
            number: counts.online,
            icon: CircleCheck,
            tone: 'bg-status-online/10 text-green-700',
          },
          {
            key: 'delivery',
            label: 'กำลังจัดส่ง',
            number: counts.delivery,
            icon: Truck,
            tone: 'bg-status-delivery/10 text-amber-700',
          },
          {
            key: 'offline',
            label: 'ออฟไลน์',
            number: counts.offline,
            icon: Clock3,
            tone: 'bg-neutral-100 text-neutral-500',
          },
        ].map(({ key, label, number, icon: Icon, tone }) => (
          <button
            type="button"
            key={key}
            aria-pressed={work === key}
            onClick={() => {
              setWork(key)
              setPage(1)
            }}
            className={`flex items-center gap-3 rounded-2xl border bg-white p-3.5 text-left transition hover:shadow-sm sm:p-5 ${work === key ? 'border-brand ring-1 ring-brand' : 'border-neutral-200/80'}`}
          >
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-12 ${tone}`}>
              <Icon className="size-5" strokeWidth={1.7} />
            </span>
            <span>
              <span className="block text-xs text-neutral-500 sm:text-sm">{label}</span>
              <span className="mt-1 block text-2xl font-semibold tabular-nums">
                {number}
                <span className="ml-1.5 text-xs font-normal text-neutral-400">คน</span>
              </span>
            </span>
          </button>
        ))}
      </section>
      <section
        aria-labelledby="rider-list-title"
        className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 px-4 py-4 sm:px-5">
          <h2 id="rider-list-title" className="flex items-center gap-2.5 font-semibold">
            <Bike className="size-5 text-neutral-500" />
            รายชื่อไรเดอร์
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
              {riders.length}
            </span>
          </h2>
          <span className="rounded-md bg-brand-light px-2 py-1 text-[11px] text-amber-800">ข้อมูลตัวอย่าง</span>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="hidden items-center gap-1.5 text-sm text-neutral-500 sm:flex">
              <Filter className="size-4" />
              ตัวกรอง
            </div>
            <label className="sr-only" htmlFor="rider-work-status">
              สถานะทั้งหมด
            </label>
            <select
              id="rider-work-status"
              value={work}
              onChange={change(setWork)}
              className="admin-input sm:w-44"
            >
              <option value="all">สถานะทั้งหมด</option>
              {Object.entries({ ...workLabels, ...accountLabels }).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {filtered && (
              <button
                type="button"
                onClick={reset}
                className="min-h-11 text-left text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-neutral-100 bg-neutral-50/70 px-4 py-3 text-xs text-neutral-500 sm:px-5">
          <p role="status" aria-live="polite">
            พบ <strong className="font-semibold text-neutral-800">{results.length}</strong> รายการ
            {filtered && ' จากตัวกรองที่เลือก'}
          </p>
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
                <article key={rider.code} className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <Avatar />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold tracking-wide text-neutral-400">{rider.code}</p>
                        <Badge value={rider.workStatus} />
                      </div>
                      <h3 className="mt-1 text-sm font-semibold leading-6 sm:text-base">{rider.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                        <Phone className="size-3.5" />
                        {rider.phone}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-3">
                    <div>
                      <p className="text-[11px] text-neutral-400">ทะเบียนรถ</p>
                      <p className="mt-1 text-sm font-medium">{rider.plate}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="size-3" />
                        {rider.province}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] text-neutral-400">สถานะไรเดอร์</p>
                      <RiderStatus rider={rider} onChange={requestStatus} />
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
                        <Smartphone
                          className={`size-3 ${rider.isLoggedIn ? 'text-brand-dark' : 'text-neutral-400'}`}
                        />
                        {rider.isLoggedIn ? 'เข้าสู่ระบบอยู่' : 'ไม่ได้เข้าสู่ระบบ'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-neutral-400">
                    ใช้งานล่าสุด
                    <br />
                    <span className="text-neutral-600">{formatRiderDate(rider.lastActiveAt)}</span>
                  </p>
                  <details className="mt-1 text-xs text-neutral-500">
                    <summary className="min-h-11 cursor-pointer py-3">ข้อมูลการแก้ไข</summary>
                    <p className="pb-2 leading-6">
                      ผู้แก้ไข: {rider.editedBy}
                      <br />
                      {formatRiderDate(rider.editedAt)}
                    </p>
                  </details>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="rider-table w-full text-left text-xs">
                <caption className="sr-only">รายชื่อไรเดอร์ พร้อมข้อมูลติดต่อ สถานะ และการใช้งานล่าสุด</caption>
                <thead>
                  <tr>
                    <th scope="col">ลำดับ</th>
                    {sortHeading('code', 'รหัสไรเดอร์')}
                    {sortHeading('name', 'ชื่อ / เบอร์โทรศัพท์')}
                    {sortHeading('plate', 'ทะเบียนรถ / จังหวัด')}
                    {sortHeading('lastActiveAt', 'ใช้งานล่าสุด')}
                    <th scope="col">เข้าสู่ระบบ</th>
                    {sortHeading('workStatus', 'สถานะงาน')}
                    {sortHeading('riderStatus', 'สถานะไรเดอร์')}
                    <th scope="col">ผู้แก้ไข / วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((rider, index) => (
                    <tr key={rider.code}>
                      <td className="text-neutral-400">{start + index + 1}</td>
                      <td className="font-semibold">{rider.code}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar small />
                          <div>
                            <p className="whitespace-nowrap font-semibold">{rider.name}</p>
                            <p className="mt-1.5 whitespace-nowrap text-neutral-500">{rider.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-medium">{rider.plate}</p>
                        <p className="mt-1.5 whitespace-nowrap text-neutral-500">{rider.province}</p>
                      </td>
                      <td className="min-w-36 text-neutral-500">{formatRiderDate(rider.lastActiveAt)}</td>
                      <td>
                        <span title={rider.isLoggedIn ? 'เข้าสู่ระบบอยู่' : 'ไม่ได้เข้าสู่ระบบ'}>
                          <Smartphone
                            aria-hidden="true"
                            className={`mx-auto size-5 ${rider.isLoggedIn ? 'text-brand-dark' : 'text-neutral-300'}`}
                          />
                          <span className="sr-only">{rider.isLoggedIn ? 'เข้าสู่ระบบอยู่' : 'ไม่ได้เข้าสู่ระบบ'}</span>
                        </span>
                      </td>
                      <td>
                        <Badge value={rider.workStatus} />
                      </td>
                      <td>
                        <RiderStatus rider={rider} onChange={requestStatus} />
                      </td>
                      <td className="min-w-40">
                        <p className="font-medium">{rider.editedBy}</p>
                        <p className="mt-1.5 text-[11px] text-neutral-400">
                          {formatRiderDate(rider.editedAt)}
                        </p>
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
      <p className="flex items-start gap-2 px-1 text-xs leading-6 text-neutral-400">
        <ShieldCheck className="mt-1 size-4 shrink-0" />
        โหมดสาธิต: ค้นหา กรอง และเปลี่ยนหน้าได้ ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่าง
      </p>
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
