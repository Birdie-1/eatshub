import { lazy, Suspense, useMemo } from 'react'
import {
  ArrowRight,
  Bike,
  CalendarDays,
  ChevronRight,
  ShoppingBag,
  Trophy,
  User,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import { formatBaht } from '@/shared/lib/format'
import { useOrders } from '@/state'
import {
  dashboardTotals,
  dashboardYear,
  getRecentOrders,
  riderSummary,
  summarizeTop,
  topCustomers,
  topRestaurants,
} from '@/data/dashboard'
import MonthlyChart from '@/admin/components/MonthlyChart'
import RecentOrders from '@/admin/components/RecentOrders'

const ServiceCoverage = lazy(() => import('@/admin/components/ServiceCoverage'))

const count = new Intl.NumberFormat('th-TH')
const topRestaurantsSummary = summarizeTop(topRestaurants)
const topCustomersSummary = summarizeTop(topCustomers)
const metrics = [
  {
    label: 'ยอดขายทั้งหมด',
    value: formatBaht(dashboardTotals.sales),
    note: 'ยอดขายในรายงานตัวอย่าง',
    icon: Wallet,
    tone: 'bg-success text-white',
    border: 'border-t-success',
  },
  {
    label: 'คำสั่งซื้อทั้งหมด',
    value: count.format(dashboardTotals.orders),
    note: 'ออเดอร์ในรายงานตัวอย่าง',
    icon: ShoppingBag,
    tone: 'bg-admin text-white',
    border: 'border-t-admin',
  },
  {
    label: 'เมนูอาหารทั้งหมด',
    value: count.format(dashboardTotals.menus),
    note: 'เมนูจากร้านในระบบ',
    icon: Utensils,
    tone: 'bg-brand text-ink',
    border: 'border-t-brand',
  },
  {
    label: 'คนขับทั้งหมด',
    value: count.format(dashboardTotals.riders),
    note: 'ตรงกับรายชื่อไรเดอร์',
    icon: Bike,
    tone: 'bg-info text-white',
    border: 'border-t-info',
  },
]

export default function Dashboard() {
  const { orders } = useOrders()
  const recent = useMemo(() => getRecentOrders(orders), [orders])
  return (
    <div className="space-y-5 sm:space-y-6">
      <nav aria-label="เส้นทางหน้า" className="flex items-center gap-2 text-xs text-neutral-500">
        <span>ระบบหลังบ้าน</span>
        <ChevronRight className="size-3" />
        <span aria-current="page" className="text-ink">
          แดชบอร์ด
        </span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-brand" />
            <span className="text-xs font-medium text-neutral-500">ภาพรวมแพลตฟอร์ม</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">แดชบอร์ด</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">ดูภาพรวมการให้บริการ ร้านอาหาร และไรเดอร์ของคุณ</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-600">
            <CalendarDays className="size-4" />
            รายงานปี {dashboardYear + 543}
          </span>
          <Badge tone="brand">ข้อมูลตัวอย่าง</Badge>
        </div>
      </div>
      <section aria-label="ตัวเลขภาพรวม" className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {metrics.map(({ label, value, note, icon: Icon, tone, border }) => (
          <Card
            key={label}
            className={`min-w-0 border border-neutral-200/80 border-t-4 shadow-none ${border}`}
          >
            <span className={`mb-4 grid size-10 place-items-center rounded-xl ${tone}`}>
              <Icon className="size-5" strokeWidth={1.7} />
            </span>
            <h2 className="text-xs text-neutral-500 sm:text-sm">{label}</h2>
            <p className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
              {value}
            </p>
            <p className="mt-2 text-[11px] leading-5 text-neutral-400">{note}</p>
          </Card>
        ))}
      </section>
      <p className="rounded-xl border border-brand/25 bg-brand-light/60 px-4 py-3 text-xs leading-6 text-neutral-600">
        ตัวเลขรายงานเป็นข้อมูลตัวอย่างของปี {dashboardYear + 543} ส่วนออเดอร์ล่าสุดแสดงรายการจากการสาธิต
      </p>
      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        <MonthlyChart
          title="ยอดขายรายเดือน"
          series="sales"
          total={dashboardTotals.sales}
          totalLabel="รวมทั้งปี"
        />
        <MonthlyChart
          title="ร้านอาหารในระบบ"
          series="restaurants"
          total={dashboardTotals.restaurants}
          totalLabel="ร้าน ณ สิ้นปี"
        />
        <MonthlyChart
          title="ลูกค้าใหม่รายเดือน"
          series="customers"
          total={dashboardTotals.customers}
          totalLabel="คนในรายงาน"
        />
      </div>
      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card
          as="section"
          className="min-w-0 border border-neutral-200/80 shadow-none"
          aria-labelledby="top-restaurants-title"
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-light text-brand-dark">
              <Trophy className="size-4" />
            </span>
            <div>
              <h2 id="top-restaurants-title" className="text-sm font-semibold">
                5 ร้านอาหารยอดขายสูงสุด
              </h2>
              <p className="mt-1 text-[11px] text-neutral-400">เรียงตามยอดขายในรายงานตัวอย่าง</p>
            </div>
          </div>
          <ol className="divide-y divide-neutral-100">
            {topRestaurants.map((restaurant, index) => (
              <li key={restaurant.id} className="flex gap-3 py-4 first:pt-0">
                <span className="w-3 shrink-0 pt-3 text-xs font-medium text-neutral-400">{index + 1}</span>
                <img
                  src={restaurant.image}
                  alt=""
                  loading="lazy"
                  className="size-11 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold">{restaurant.name}</h3>
                    <p className="whitespace-nowrap text-sm font-semibold tabular-nums">
                      {formatBaht(restaurant.sales)}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-500">{restaurant.address}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {count.format(restaurant.orders)} ออเดอร์
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-3 py-3 text-xs">
            <span className="text-neutral-500">
              รวม {topRestaurants.length} ร้าน · {count.format(topRestaurantsSummary.orders)} ออเดอร์ ·{' '}
              {topRestaurantsSummary.share}% ของยอดขาย
            </span>
            <strong>{formatBaht(topRestaurantsSummary.sales)}</strong>
          </div>
        </Card>
        <Card
          as="section"
          className="min-w-0 border border-neutral-200/80 shadow-none"
          aria-labelledby="top-customers-title"
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-info-light text-info">
              <Users className="size-4" />
            </span>
            <div>
              <h2 id="top-customers-title" className="text-sm font-semibold">
                5 ลูกค้ายอดสั่งซื้อสูงสุด
              </h2>
              <p className="mt-1 text-[11px] text-neutral-400">รายชื่อสมมติสำหรับการนำเสนอ</p>
            </div>
          </div>
          <ol className="divide-y divide-neutral-100">
            {topCustomers.map((customer, index) => (
              <li key={customer.name} className="flex items-center gap-3 py-4 first:pt-0">
                <span className="w-3 shrink-0 text-xs font-medium text-neutral-400">{index + 1}</span>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-400">
                  <User className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold">{customer.name}</h3>
                    <p className="whitespace-nowrap text-sm font-semibold tabular-nums">
                      {formatBaht(customer.sales)}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">{count.format(customer.orders)} ออเดอร์</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-3 py-3 text-xs">
            <span className="text-neutral-500">
              รวม {topCustomers.length} คน · {count.format(topCustomersSummary.orders)} ออเดอร์ ·{' '}
              {topCustomersSummary.share}% ของยอดขาย
            </span>
            <strong>{formatBaht(topCustomersSummary.sales)}</strong>
          </div>
        </Card>
      </div>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card
          as="section"
          className="min-w-0 border border-neutral-200/80 shadow-none"
          aria-labelledby="rider-overview-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="rider-overview-title" className="flex items-center gap-2 text-sm font-semibold">
              <Bike className="size-5 text-neutral-500" />
              สถานะไรเดอร์
            </h2>
            <span className="text-xs text-neutral-400">{riderSummary.total} คน</span>
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['พร้อมรับงาน', riderSummary.online, 'bg-success-light text-success'],
              ['กำลังจัดส่ง', riderSummary.delivery, 'bg-warning-light text-warning'],
              ['ออฟไลน์', riderSummary.offline, 'bg-danger-light text-danger'],
            ].map(([label, value, tone]) => (
              <div key={label} className={`rounded-xl px-1 py-3 text-center ${tone}`}>
                <dt className="text-[10px] leading-5">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-6 text-neutral-500">
            <Badge tone="danger">ถูกระงับ {riderSummary.blocked} บัญชี</Badge>
            <span className="mt-2 block">นับรวมอยู่ในไรเดอร์ทั้งหมดแล้ว</span>
          </p>
          <Button to="/admin/riders" variant="ghost" block className="mt-4 border border-neutral-200 text-sm">
            จัดการไรเดอร์
            <ArrowRight className="size-4" />
          </Button>
        </Card>
        <RecentOrders orders={recent} />
      </div>
      <Suspense
        fallback={
          <Card>
            <p className="text-sm text-neutral-500">กำลังโหลดพื้นที่ให้บริการ…</p>
          </Card>
        }
      >
        <ServiceCoverage />
      </Suspense>
    </div>
  )
}
