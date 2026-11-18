import { Link } from 'react-router'
import { ClipboardList } from 'lucide-react'
import { useOrders } from '@/state'
import { useOrderClock } from '@/shared/hooks/useOrderClock'
import { formatOrderDate, getStatus, isRated, ORDER_STEPS, PAYMENT_LABELS } from '@/state/orders'
import { formatAmount } from '@/shared/lib/format'
import TopBar from '@/shared/components/TopBar'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import StarRating from '@/customer/components/StarRating'

export default function Orders() {
  const { orders } = useOrders()
  const now = useOrderClock()
  return (
    <div className="min-h-full bg-surface">
      <TopBar title="ออเดอร์ของฉัน" backTo="/app" />
      <div className="space-y-4 p-4">
        {orders.length ? (
          <>
            <p className="text-xs text-neutral-500">ประวัติคำสั่งซื้อทั้งหมด {orders.length} รายการ</p>
            {orders.map((order) => {
              const status = getStatus(order, now),
                active = status < 5
              return (
                <Card key={order.id} className="border border-neutral-100 shadow-none">
                  <Link to={`/app/orders/${order.id}`} className="block">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-neutral-400">{order.id}</p>
                      <Badge tone={status === 6 ? 'danger' : status === 5 ? 'success' : 'brand'}>
                        {status === 6 ? 'ยกเลิกออเดอร์' : ORDER_STEPS[status - 1].label}
                      </Badge>
                    </div>
                    <h2 className="mt-3 font-semibold">{order.restaurant.name}</h2>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-neutral-500">{PAYMENT_LABELS[order.payment]}</p>
                      <p className="text-lg font-semibold">{formatAmount(order.totals.total)} ฿</p>
                    </div>
                    <p className="mt-2 text-[11px] text-neutral-400">{formatOrderDate(order.createdAt)}</p>
                  </Link>
                  {active ? (
                    <Button block className="mt-4" to={`/app/orders/${order.id}`}>
                      ติดตามคำสั่งซื้อ
                    </Button>
                  ) : status === 5 ? (
                    isRated(order) ? (
                      <p className="mt-4 flex items-center gap-1">
                        <StarRating value={order.rating || order.riderRating} />
                        <span className="ml-2 text-xs text-neutral-500">
                          {order.rating ? 'ให้คะแนนร้านแล้ว' : 'ให้คะแนนไรเดอร์แล้ว'}{' '}
                          {order.rating || order.riderRating}/5
                        </span>
                      </p>
                    ) : (
                      <Link
                        to={`/app/orders/${order.id}`}
                        state={{ rate: true }}
                        className="mt-3 inline-flex min-h-11 items-center text-sm text-brand-dark"
                      >
                        เขียนรีวิว
                      </Link>
                    )
                  ) : null}
                </Card>
              )
            })}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
            <ClipboardList className="size-16 text-brand-dark" />
            <h2 className="text-xl font-semibold">ยังไม่มีคำสั่งซื้อ</h2>
            <p className="text-sm text-neutral-500">มื้ออร่อยครั้งแรกกำลังรอคุณอยู่</p>
            <Button to="/app">เลือกร้านอาหาร</Button>
          </div>
        )}
      </div>
    </div>
  )
}
