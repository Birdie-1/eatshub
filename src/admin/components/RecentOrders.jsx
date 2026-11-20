import { ShoppingBag } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import { formatAmount } from '@/shared/lib/format'
import { formatOrderDate, getStatus, ORDER_STEPS, PAYMENT_LABELS } from '@/state/orders'
import { useOrderClock } from '@/shared/hooks/useOrderClock'

export default function RecentOrders({ orders }) {
  const now = useOrderClock()
  const statusBadge = (order) => {
    const status = getStatus(order, now)
    return (
      <Badge tone={status === 6 ? 'danger' : status === 5 ? 'success' : 'brand'}>
        {status === 6 ? 'ยกเลิกออเดอร์' : ORDER_STEPS[status - 1].label}
      </Badge>
    )
  }
  return (
    <section aria-labelledby="recent-orders-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="recent-orders-title" className="text-lg font-semibold sm:text-xl">
            ออเดอร์ล่าสุด
          </h2>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">จากการสั่งอาหารในแอปลูกค้า · สูงสุด 5 รายการ</p>
        </div>
        {orders.length > 0 && <Badge>{orders.length} รายการ</Badge>}
      </div>
      <Card className="min-w-0 overflow-hidden border border-neutral-200 shadow-none sm:p-6">
        {!orders.length ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-4 py-10 text-center">
            <ShoppingBag className="size-9 text-neutral-400" />
            <h3 className="text-sm font-semibold">ยังไม่มีคำสั่งซื้อจากการสาธิต</h3>
            <p className="text-xs leading-6 text-neutral-500">เมื่อสั่งอาหารในแอปลูกค้า รายการจะแสดงที่นี่</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-neutral-100 lg:hidden">
              {orders.map((order) => (
                <li key={order.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="break-all text-[11px] font-semibold text-neutral-500">{order.id}</span>
                    {statusBadge(order)}
                  </div>
                  <h3 className="text-sm font-semibold">{order.restaurant.name}</h3>
                  <p className="text-[11px] text-neutral-400">{formatOrderDate(order.createdAt)}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-neutral-500">{PAYMENT_LABELS[order.payment]}</span>
                    <strong className="text-sm font-semibold">{formatAmount(order.totals.total)} ฿</strong>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">ออเดอร์ล่าสุดจากแอปลูกค้า ไม่เกินห้ารายการ</caption>
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    {['ออเดอร์ / วันที่', 'ร้านอาหาร', 'วิธีชำระเงิน', 'ยอดรวม', 'สถานะ'].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="whitespace-nowrap px-3 py-3 font-medium first:pl-0 last:pr-0"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100 last:border-0">
                      <th scope="row" className="whitespace-nowrap py-4 pr-3 font-medium">
                        <p>{order.id}</p>
                        <p className="mt-1.5 text-[11px] font-normal text-neutral-400">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </th>
                      <td className="max-w-48 truncate px-3 py-4" title={order.restaurant.name}>
                        {order.restaurant.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-neutral-500">
                        {PAYMENT_LABELS[order.payment]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 font-semibold">
                        {formatAmount(order.totals.total)} ฿
                      </td>
                      <td className="py-4 pl-3">{statusBadge(order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </section>
  )
}
