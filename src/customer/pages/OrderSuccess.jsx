import { useParams } from 'react-router'
import { Check, ShoppingBag } from 'lucide-react'
import Button from '@/shared/components/Button'
import TopBar from '@/shared/components/TopBar'
import { useOrders } from '@/state'
import { formatAmount } from '@/shared/lib/format'
import { PAYMENT_LABELS } from '@/state/orders'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const { getOrder } = useOrders()
  const order = getOrder(orderId)
  if (!order)
    return (
      <div>
        <TopBar title="คำสั่งซื้อ" backTo="/app/orders" />
        <div className="space-y-4 p-6">
          <h2>ไม่พบออเดอร์นี้</h2>
          <Button to="/app/orders">ไปแท็บออเดอร์</Button>
        </div>
      </div>
    )
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">
      <span className="grid size-24 animate-[fade-in_300ms_ease-out] place-items-center rounded-full bg-success-light text-success">
        <Check className="size-12" />
      </span>
      <h1 className="mt-6 text-2xl font-bold">{order.payment === 'cod' ? 'สั่งอาหารสำเร็จ' : 'ชำระเงินสำเร็จ'}</h1>
      <p className="mt-3 text-sm text-neutral-500">ร้านได้รับคำสั่งซื้อของคุณแล้ว</p>
      <div className="my-8 w-full space-y-3 rounded-2xl bg-surface p-5">
        <ShoppingBag className="mx-auto size-6 text-brand-dark" />
        <p className="break-all text-xs font-semibold text-neutral-500">{order.id}</p>
        <p className="text-3xl font-bold" data-testid="success-total">
          {formatAmount(order.totals.total)} ฿
        </p>
        <p className="text-sm text-neutral-500">{PAYMENT_LABELS[order.payment]}</p>
      </div>
      <Button size="lg" block to={`/app/orders/${order.id}`}>
        ติดตามออเดอร์
      </Button>
      <Button variant="ghost" block className="mt-2" to="/app/orders">
        ดูออเดอร์ทั้งหมด
      </Button>
    </div>
  )
}
