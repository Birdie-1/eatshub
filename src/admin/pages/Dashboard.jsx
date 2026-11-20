import { lazy, Suspense, useMemo } from 'react'
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import { formatBaht } from '@/shared/lib/format'
import { useOrders } from '@/state'
import {
  averageOrderValue,
  dashboardTotals,
  dashboardYear,
  getRecentOrders,
  halfYearGrowth,
} from '@/data/dashboard'
import MonthlyChart from '@/admin/components/MonthlyChart'
import TopRestaurants from '@/admin/components/TopRestaurants'
import RecentOrders from '@/admin/components/RecentOrders'
import RiderPerformance from '@/admin/components/RiderPerformance'

const ServiceCoverage = lazy(() => import('@/admin/components/ServiceCoverage'))

const count = new Intl.NumberFormat('th-TH')
const year = dashboardYear + 543
const kpis = [
  { label: 'ยอดขาย', value: formatBaht(dashboardTotals.sales), growth: halfYearGrowth('sales') },
  { label: 'ออเดอร์', value: count.format(dashboardTotals.orders), growth: halfYearGrowth('orders') },
  { label: 'ยอดเฉลี่ยต่อออเดอร์', value: formatBaht(averageOrderValue), note: 'ยอดขาย ÷ จำนวนออเดอร์' },
  {
    label: 'ลูกค้าใหม่',
    value: count.format(dashboardTotals.customers),
    unit: 'คน',
    growth: halfYearGrowth('customers'),
  },
]

function Growth({ value }) {
  const Icon = value < 0 ? TrendingDown : TrendingUp
  const tone = value < 0 ? 'text-danger' : 'text-success'
  return (
    <>
      <Icon className={`size-3.5 shrink-0 ${tone}`} aria-hidden="true" />
      <span>
        <strong className={`font-semibold ${tone}`}>
          {value > 0 ? '+' : ''}
          {value}%
        </strong>{' '}
        จากครึ่งปีแรก
      </span>
    </>
  )
}

export default function Dashboard() {
  const { orders } = useOrders()
  const recent = useMemo(() => getRecentOrders(orders), [orders])
  return (
    <div className="space-y-10 sm:space-y-12">
      <header>
        <nav aria-label="เส้นทางหน้า" className="flex items-center gap-2 text-xs text-neutral-500">
          <span>ระบบหลังบ้าน</span>
          <ChevronRight className="size-3" aria-hidden="true" />
          <span aria-current="page" className="text-ink">
            แดชบอร์ด
          </span>
        </nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">แดชบอร์ด</h1>
            <p className="mt-1.5 text-sm text-neutral-500">ยอดขาย พื้นที่บริการ ไรเดอร์ และออเดอร์ล่าสุด</p>
          </div>
          <Badge tone="brand">ข้อมูลตัวอย่าง</Badge>
        </div>
      </header>

      <section aria-labelledby="report-title" className="space-y-4">
        <div>
          <h2 id="report-title" className="text-lg font-semibold sm:text-xl">
            ภาพรวมปี {year}
          </h2>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">รายงานตัวอย่างทั้งปี ม.ค.–ธ.ค. {year}</p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 lg:grid-cols-4">
          {kpis.map(({ label, value, unit, growth, note }) => (
            <div key={label} className="min-w-0 bg-white p-4 sm:p-5">
              <dt className="text-xs text-neutral-500 sm:text-sm">{label}</dt>
              <dd className="mt-2 whitespace-nowrap text-2xl font-semibold tracking-tight tabular-nums sm:text-[2rem]">
                {value}
                {unit && <span className="ml-1 text-sm font-normal text-neutral-500">{unit}</span>}
              </dd>
              <dd className="mt-2 flex items-start gap-1 text-[11px] leading-5 text-neutral-500 sm:text-xs">
                {growth == null ? note : <Growth value={growth} />}
              </dd>
            </div>
          ))}
        </dl>
        <Suspense
          fallback={
            <Card className="border border-neutral-200 shadow-none">
              <p className="text-sm text-neutral-500">กำลังโหลดแผนที่…</p>
            </Card>
          }
        >
          <ServiceCoverage />
        </Suspense>
        <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <MonthlyChart title="ยอดขายรายเดือน" series="sales" />
          <TopRestaurants />
        </div>
      </section>

      <RiderPerformance />

      <RecentOrders orders={recent} />
    </div>
  )
}
