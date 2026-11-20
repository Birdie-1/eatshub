import { useState } from 'react'
import { useParams } from 'react-router'
import { Banknote, Check, CircleCheck, Clock3, MapPin, Store } from 'lucide-react'
import TopBar from '@/shared/components/TopBar'
import Button from '@/shared/components/Button'
import Card from '@/shared/components/Card'
import { formatAmount } from '@/shared/lib/format'
import { useOrderClock } from '@/shared/hooks/useOrderClock'
import { RIDER_EARNING } from '@/data/riderProfile'
import { formatChoices, useOrders } from '@/state'
import { getStatus, PAYMENT_LABELS } from '@/state/orders'
import SignaturePad from '@/rider/components/SignaturePad'
import ChatButton from '@/shared/components/ChatButton'
import { unreadCount } from '@/state/chat'
import { useDemoCustomerReply } from '@/rider/useDemoCustomerReply'

/** Rider stages 2–4 of the order (ORDER_STEPS): stepper label, what's happening, and the next button. */
const STAGES = [
  { label: 'ไปยังร้านค้า', title: 'กำลังไปยังร้านค้า', action: 'ถึงร้านค้าแล้ว' },
  { label: 'รับอาหาร', title: 'ถึงร้านแล้ว รอรับอาหาร', action: 'รับอาหารแล้ว' },
  { label: 'ส่งอาหาร', title: 'กำลังนำส่งอาหารให้ลูกค้า', action: 'ส่งอาหารแล้ว' },
]

function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return minutes ? `${minutes} นาที ${seconds} วินาที` : `${seconds} วินาที`
}

function Stepper({ index }) {
  return (
    <ol className="grid grid-cols-3 gap-2">
      {STAGES.map((stage, i) => (
        <li key={stage.label} aria-current={i === index ? 'step' : undefined} className="text-center">
          <span
            className={`mx-auto grid size-8 place-items-center rounded-full text-sm font-semibold ${i < index ? 'bg-brand text-ink' : i === index ? 'bg-brand-light ring-2 ring-brand' : 'bg-neutral-100 text-neutral-400'}`}
          >
            {i < index ? <Check className="size-4" aria-label="เสร็จแล้ว" /> : i + 1}
          </span>
          <span className={`mt-1.5 block text-xs ${i <= index ? 'font-medium' : 'text-neutral-400'}`}>
            {stage.label}
          </span>
        </li>
      ))}
    </ol>
  )
}

function Message({ title, children }) {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar title="งานของฉัน" backTo="/rider" />
      <div className="space-y-4 p-6 text-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        {children}
        <Button to="/rider">กลับหน้าแรก</Button>
      </div>
    </div>
  )
}

/** R4 — job in progress: stepper, pickup/drop-off, the order snapshot, one button per stage, then R4 summary. */
export default function Job() {
  const { orderId } = useParams()
  const { getOrder, advanceJob } = useOrders()
  const now = useOrderClock()
  const [signed, setSigned] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const order = getOrder(orderId)
  useDemoCustomerReply(order?.riderJob ? order : null, now)

  if (!order?.riderJob) return <Message title="ไม่พบงานนี้" />
  const chatPath = `/rider/jobs/${order.id}/chat`
  const status = getStatus(order, now)
  if (status === 6)
    return (
      <Message title="ออเดอร์นี้ถูกยกเลิก">
        <p className="text-sm text-neutral-500">{order.id}</p>
      </Message>
    )

  if (status === 5) {
    const { times } = order.riderJob
    return (
      <div className="flex min-h-full flex-col bg-surface">
        <TopBar title="สรุปรายได้" backTo="/rider" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card className="text-center">
            <CircleCheck className="mx-auto size-16 text-success" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">ส่งอาหารเรียบร้อย</h2>
            <p className="mt-1 break-all text-xs text-neutral-500">{order.id}</p>
            <p className="mt-5 text-sm text-neutral-500">รายได้จากงานนี้</p>
            <p className="text-4xl font-bold">{formatAmount(RIDER_EARNING)} ฿</p>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-neutral-600">
              <Clock3 className="size-4" aria-hidden="true" />
              ใช้เวลา {formatDuration(Date.parse(times.at(-1)) - Date.parse(times[0]))}
            </p>
          </Card>
          <Card className="text-sm">
            <p className="font-medium">{order.restaurant.name}</p>
            <p className="mt-1 text-xs text-neutral-500">ส่งถึง ลูกค้า · {order.address.label}</p>
          </Card>
          {order.messages?.length > 0 && (
            <ChatButton block to={chatPath}>
              ดูแชทกับลูกค้า
            </ChatButton>
          )}
          <Button block size="lg" to="/rider" className="mt-auto">
            จบงาน
          </Button>
        </div>
      </div>
    )
  }

  const index = status - 2
  const stage = STAGES[index]
  const delivering = status === 4
  const ready = !delivering || signed || confirmed
  const cod = order.payment === 'cod'
  const { totals } = order
  const priceRows = [
    ['ค่าอาหารรวม', totals.food],
    ['ค่าจัดส่ง', totals.delivery],
    ...(totals.storeDiscount ? [['ส่วนลดร้าน', -totals.storeDiscount]] : []),
    ...(totals.couponDiscount ? [['ส่วนลดคูปอง', -totals.couponDiscount]] : []),
  ]

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar title={`ออเดอร์ ${order.id}`} backTo="/rider" />
      <div className="flex-1 space-y-4 p-4">
        <Card className="space-y-4">
          <Stepper index={index} />
          <h2 className="text-center font-semibold" aria-live="polite">
            {stage.title}
          </h2>
        </Card>

        <Card as="ol" className="space-y-3 text-sm">
          <li className={`flex gap-3 ${status > 3 ? 'opacity-50' : ''}`}>
            <Store className="mt-0.5 size-5 shrink-0 text-brand-dark" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">จุดรับ</p>
              <p className="font-medium">{order.restaurant.name}</p>
              <p className="text-xs leading-5 text-neutral-500">{order.restaurant.address}</p>
            </div>
          </li>
          <li className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">จุดส่ง</p>
              <p className="font-medium">ลูกค้า · {order.address.label}</p>
              <p className="text-xs leading-5 text-neutral-500">{order.address.detail}</p>
            </div>
          </li>
        </Card>

        <ChatButton block to={chatPath} unread={unreadCount(order, 'rider')}>
          แชทกับลูกค้า
        </ChatButton>

        {order.notes?.noteToRider && (
          <p className="rounded-2xl bg-brand-light p-3 text-sm leading-6">
            <strong>หมายเหตุถึงไรเดอร์:</strong> {order.notes.noteToRider}
          </p>
        )}

        <Card className="space-y-3">
          <h2 className="font-semibold">รายการอาหาร</h2>
          <ul className="divide-y divide-neutral-100">
            {order.items.map((item) => (
              <li key={item.key} className="flex gap-3 py-2.5 text-sm">
                <span className="font-semibold">{item.qty}×</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs leading-5 text-neutral-500">{formatChoices(item)}</p>
                  {item.note && <p className="text-xs text-neutral-500">หมายเหตุ: {item.note}</p>}
                </div>
                <span className="whitespace-nowrap">{formatAmount(item.lineTotal)} ฿</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-neutral-100 pt-3 text-sm">
            {priceRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-neutral-500">{label}</dt>
                <dd className={value < 0 ? 'text-success' : ''}>
                  {value < 0 ? `−${formatAmount(-value)}` : formatAmount(value)} ฿
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t border-dashed border-neutral-200 pt-2 font-semibold">
              <dt>ยอดรวม</dt>
              <dd>{formatAmount(totals.total)} ฿</dd>
            </div>
          </dl>
          <p
            className={`flex items-center gap-2 rounded-xl p-3 text-sm ${cod ? 'bg-warning-light' : 'bg-success-light'}`}
          >
            <Banknote className="size-5 shrink-0" aria-hidden="true" />
            {cod
              ? `เก็บเงินปลายทาง ${formatAmount(totals.total)} ฿`
              : `ลูกค้าชำระแล้วผ่าน ${PAYMENT_LABELS[order.payment]}`}
          </p>
        </Card>

        {delivering && (
          <Card className="space-y-3">
            <SignaturePad hasInk={signed} onChange={setSigned} />
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="size-5 accent-brand-dark"
              />
              ยืนยันว่าส่งถึงมือลูกค้าแล้ว (แทนลายเซ็น)
            </label>
          </Card>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-neutral-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button block size="lg" disabled={!ready} onClick={() => advanceJob(order.id, status)}>
          {stage.action}
        </Button>
      </div>
    </div>
  )
}
