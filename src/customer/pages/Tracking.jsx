import { useState } from 'react'
import { useLocation, useParams } from 'react-router'
import {
  Bike,
  Check,
  CheckCheck,
  Clock3,
  MapPin,
  PackageCheck,
  ReceiptText,
  Star,
  Store,
  X,
} from 'lucide-react'
import TopBar from '@/shared/components/TopBar'
import Button from '@/shared/components/Button'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import { toast } from '@/shared/components/Toast'
import OrderSummary from '@/customer/components/OrderSummary'
import RatingSheet from '@/customer/components/RatingSheet'
import StarRating from '@/customer/components/StarRating'
import { useOrders } from '@/state'
import { useOrderClock } from '@/shared/hooks/useOrderClock'
import {
  formatOrderDate,
  getStatus,
  isRated,
  ORDER_STEPS,
  ORDER_STEP_MS,
  PAYMENT_LABELS,
  paymentStatus,
} from '@/state/orders'

const icons = [ReceiptText, Bike, Store, PackageCheck, CheckCheck]
const time = (value) =>
  new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value))

export default function Tracking() {
  const { orderId } = useParams()
  const { getOrder, advance, rate } = useOrders()
  const now = useOrderClock()
  const location = useLocation()
  // The order history's "เขียนรีวิว" link opens the rating sheet straight away.
  const [rating, setRating] = useState(Boolean(location.state?.rate))
  const order = getOrder(orderId)
  if (!order)
    return (
      <div>
        <TopBar title="ติดตามออเดอร์" backTo="/app/orders" />
        <div className="space-y-4 p-6 text-center">
          <h2 className="text-xl font-semibold">ไม่พบออเดอร์นี้</h2>
          <Button to="/app/orders">ไปแท็บออเดอร์</Button>
        </div>
      </div>
    )
  const status = getStatus(order, now)
  const cancelled = status === 6
  const complete = status === 5
  const step = cancelled ? { label: 'ยกเลิกออเดอร์', message: 'ออเดอร์ถูกยกเลิก' } : ORDER_STEPS[status - 1]
  const Illustration = cancelled ? X : icons[status - 1]
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar title={`ออเดอร์: ${order.id}`} backTo="/app/orders" />
      <div className="space-y-4 p-4">
        <Card className="border border-neutral-100 text-center shadow-none">
          <div key={status} className="animate-[fade-in_250ms_ease-out]">
            <span
              className={`mx-auto grid size-24 place-items-center rounded-3xl ${cancelled ? 'bg-danger-light text-danger' : complete ? 'bg-success-light text-success' : 'bg-brand-light text-brand-dark'}`}
            >
              <Illustration className="size-12" strokeWidth={1.5} />
            </span>
            <Badge tone={cancelled ? 'danger' : complete ? 'success' : 'brand'} className="mx-auto mb-3 mt-5">
              {step.label}
            </Badge>
            <h2 className="text-lg font-semibold leading-8" aria-live="polite">
              {step.message}
            </h2>
            {!complete && !cancelled && (
              <p className="mt-2 text-sm text-neutral-500">
                คุณจะได้รับอาหารภายใน <strong className="text-ink">{step.minutes} นาที</strong>
              </p>
            )}
          </div>
          {!complete && !cancelled && (
            <button
              className="mt-4 min-h-11 text-xs text-neutral-500 underline underline-offset-4"
              onClick={() => advance(order.id)}
            >
              ข้ามไปขั้นถัดไป ›
            </button>
          )}
        </Card>
        {!cancelled && (
          <Card className="border border-neutral-100 shadow-none">
            <h2 className="mb-5 font-semibold">สถานะการจัดส่ง</h2>
            <ol className="space-y-0">
              {ORDER_STEPS.map((item, index) => {
                const passed = index + 1 < status,
                  current = index + 1 === status
                return (
                  <li
                    key={item.label}
                    aria-current={current ? 'step' : undefined}
                    className="relative flex gap-4 pb-5 last:pb-0"
                  >
                    {index < 4 && (
                      <span
                        className={`absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-0.5 ${passed ? 'bg-brand' : 'bg-neutral-100'}`}
                      />
                    )}
                    <span
                      className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full ${passed ? 'bg-brand text-ink' : current ? 'bg-brand-light ring-2 ring-brand' : 'bg-neutral-100 text-neutral-400'}`}
                    >
                      {passed ? (
                        <Check className="size-4" />
                      ) : current ? (
                        <span className="size-2 rounded-full bg-brand-dark motion-safe:animate-pulse" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${index + 1 <= status ? 'font-medium' : 'text-neutral-400'}`}>
                        {item.label}
                      </p>
                      {index + 1 <= status && (
                        <p className="mt-1 text-[11px] text-neutral-400">
                          {time(Date.parse(order.createdAt) + index * ORDER_STEP_MS - (order.offsetMs || 0))}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>
        )}
        {status >= 2 && status <= 5 && order.rider && (
          <Card className="border border-neutral-100 shadow-none">
            <h2 className="mb-4 font-semibold">ไรเดอร์ของคุณ</h2>
            <div className="flex items-center gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-light text-brand-dark">
                <Bike className="size-7" />
              </span>
              <div>
                <p className="text-sm font-semibold">{order.rider.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {order.rider.code} · {order.rider.plate}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                  <Star className="size-3 fill-brand text-brand" />
                  {order.rider.rating || 4.5}/5 · {order.rider.phone}
                </p>
              </div>
            </div>
          </Card>
        )}
        <Card className="space-y-3 border border-neutral-100 shadow-none">
          <h2 className="font-semibold">ข้อมูลคำสั่งซื้อ</h2>
          <dl className="space-y-3 text-xs">
            {[
              ['หมายเลขออเดอร์', order.id],
              ['วิธีชำระเงิน', PAYMENT_LABELS[order.payment]],
              ['สถานะการจ่าย', paymentStatus(order, status)],
              ['รูปแบบการสั่ง', 'เดลิเวอรี่'],
              ['วันที่สั่ง', formatOrderDate(order.createdAt)],
              ['สถานะการสั่ง', step.label],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="shrink-0 text-neutral-500">{label}</dt>
                <dd className="break-all text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <OrderSummary {...order} />
        <Card className="space-y-4 border border-neutral-100 shadow-none">
          <div>
            <h2 className="flex items-center gap-2 font-semibold">
              <Store className="size-4 text-brand-dark" />
              ข้อมูลร้าน
            </h2>
            <p className="mt-2 text-sm">{order.restaurant.name}</p>
            <p className="mt-1 text-xs leading-6 text-neutral-500">{order.restaurant.address}</p>
          </div>
          <div className="border-t border-neutral-100 pt-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <MapPin className="size-4 text-brand-dark" />
              ที่อยู่จัดส่ง · {order.address.label}
            </h2>
            <p className="mt-2 text-xs leading-6 text-neutral-500">{order.address.detail}</p>
          </div>
        </Card>
        {complete && isRated(order) && (
          <Card className="space-y-3 border border-neutral-100 shadow-none">
            <h2 className="font-semibold">คะแนนของคุณ</h2>
            <dl className="space-y-3 text-xs">
              {[
                ['ไรเดอร์', order.riderRating],
                ['ร้านค้า', order.rating],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-neutral-500">{label}</dt>
                    <dd className="flex items-center gap-2">
                      <StarRating value={value} />
                      <span className="font-medium">{value}/5</span>
                    </dd>
                  </div>
                ))}
            </dl>
            {order.review && (
              <p className="rounded-xl bg-surface p-3 text-xs leading-6 text-neutral-600">“{order.review}”</p>
            )}
          </Card>
        )}
        {complete && (
          <div className="space-y-2">
            {isRated(order) ? (
              <Button block to="/app">
                กลับหน้าแรก
              </Button>
            ) : (
              <Button block onClick={() => setRating(true)}>
                ให้คะแนน
              </Button>
            )}
            <div className={isRated(order) ? '' : 'grid grid-cols-2 gap-2'}>
              {!isRated(order) && (
                <Button block variant="secondary" to="/app">
                  กลับหน้าแรก
                </Button>
              )}
              <Button block variant="secondary" to={`/app/restaurant/${order.restaurant.id}`}>
                สั่งอีกครั้ง
              </Button>
            </div>
          </div>
        )}
        <p className="pb-3 text-center text-[11px] text-neutral-400">
          สถานะและเวลาจัดส่งเป็นการจำลองสำหรับนำเสนอ
        </p>
      </div>
      <RatingSheet
        open={rating && complete && !isRated(order)}
        order={order}
        onClose={() => setRating(false)}
        onSubmit={(stars) => {
          rate(order.id, stars)
          setRating(false)
          toast('ขอบคุณสำหรับคะแนน')
        }}
      />
    </div>
  )
}
