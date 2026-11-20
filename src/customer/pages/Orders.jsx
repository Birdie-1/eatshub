import { ClipboardList } from 'lucide-react'
import { useOrders } from '@/state'
import { useOrderClock } from '@/shared/hooks/useOrderClock'
import { getStatus } from '@/state/orders'
import TopBar from '@/shared/components/TopBar'
import Button from '@/shared/components/Button'
import OrderHistoryCard from '@/customer/components/OrderHistoryCard'

/**
 * C11 order history: in-progress orders first (they carry the track action), then everything delivered or
 * cancelled. Each list keeps the newest-first order from useOrders(); cards move across as the clock ticks.
 */
export default function Orders() {
  const { orders } = useOrders()
  const now = useOrderClock()
  const rows = orders.map((order) => ({ order, status: getStatus(order, now) }))
  const sections = [
    { title: 'กำลังดำเนินการ', rows: rows.filter((row) => row.status < 5) },
    { title: 'ประวัติคำสั่งซื้อ', rows: rows.filter((row) => row.status >= 5) },
  ].filter((section) => section.rows.length)

  return (
    <div className="min-h-full bg-surface">
      <TopBar title="ออเดอร์ของฉัน" backTo="/app" />
      {orders.length ? (
        <div className="space-y-6 p-4">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 flex items-baseline gap-1.5 text-sm font-semibold">
                {section.title}
                <span className="text-xs font-normal text-muted">{section.rows.length} รายการ</span>
              </h2>
              <div className="space-y-3">
                {section.rows.map(({ order, status }) => (
                  <OrderHistoryCard key={order.id} order={order} status={status} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-light text-brand-dark">
            <ClipboardList className="size-8" />
          </span>
          <h2 className="font-semibold">ยังไม่มีคำสั่งซื้อ</h2>
          <p className="text-sm text-muted">มื้ออร่อยครั้งแรกกำลังรอคุณอยู่</p>
          <Button to="/app" className="mt-2">
            เลือกร้านอาหาร
          </Button>
        </div>
      )}
    </div>
  )
}
