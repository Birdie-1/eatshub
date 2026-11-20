import { Link } from 'react-router'
import { Star, Store } from 'lucide-react'
import { formatOrderDate, isRated, ORDER_STEPS, PAYMENT_LABELS } from '@/state/orders'
import { formatAmount } from '@/shared/lib/format'
import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import StarRating from './StarRating'

/**
 * What was ordered, from the frozen items: "ข้าวผัดกุ้ง ×2", or with several lines the count first so it
 * survives truncation: "3 รายการ · ข้าวผัดกุ้ง ×2, ชาไทย ×1, …".
 */
function itemSummary(items = []) {
  const names = items.map((item) => `${item.name} ×${item.qty}`).join(', ')
  return items.length > 1 ? `${items.length} รายการ · ${names}` : names
}

/**
 * One order on C11. The top half links to C10; the footer pairs the coloured status with the one action
 * that fits it: track (in progress), write a review (delivered, unrated) or the stars already given.
 * `status` is getStatus(order) — 1–5 per ORDER_STEPS, 6 when cancelled.
 */
export default function OrderHistoryCard({ order, status }) {
  const active = status < 5,
    cancelled = status === 6
  const stars = order.rating || order.riderRating
  const image = order.restaurant.image

  return (
    <article
      className={`rounded-2xl bg-white p-3 shadow-sm ring-1 ${active ? 'ring-brand/50' : 'ring-neutral-100'}`}
    >
      <Link to={`/app/orders/${order.id}`} className="-m-1 flex gap-3 rounded-xl p-1 active:bg-neutral-50">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className={`size-16 shrink-0 rounded-xl bg-surface object-cover ${cancelled ? 'opacity-60 grayscale' : ''}`}
          />
        ) : (
          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-surface text-muted">
            <Store className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate font-semibold">{order.restaurant.name}</h3>
            <p className={`shrink-0 font-semibold tabular-nums ${cancelled ? 'text-muted' : ''}`}>
              {formatAmount(order.totals.total)} ฿
            </p>
          </div>
          <p className="truncate text-sm text-neutral-500">{itemSummary(order.items)}</p>
          <p className="mt-1 text-[11px] leading-4 text-neutral-500 tabular-nums">{order.id}</p>
          <p className="text-[11px] leading-4 text-neutral-500">
            {formatOrderDate(order.createdAt)} · {PAYMENT_LABELS[order.payment]}
          </p>
        </div>
      </Link>

      <div className="mt-3 flex min-h-9 items-center justify-between gap-3 border-t border-neutral-100 pt-3">
        <Badge tone={cancelled ? 'danger' : active ? 'brand' : 'success'}>
          {cancelled ? 'ยกเลิกออเดอร์' : ORDER_STEPS[status - 1].label}
        </Badge>
        {active ? (
          <Button size="sm" to={`/app/orders/${order.id}`}>
            ติดตามคำสั่งซื้อ
          </Button>
        ) : status === 5 && isRated(order) ? (
          <p className="flex items-center gap-1.5 text-xs font-medium">
            <StarRating value={stars} className="size-3.5" />
            <span className="sr-only">{order.rating ? 'ให้คะแนนร้านแล้ว' : 'ให้คะแนนไรเดอร์แล้ว'}</span>
            <span className="tabular-nums">{stars}/5</span>
          </p>
        ) : status === 5 ? (
          <Button size="sm" variant="secondary" to={`/app/orders/${order.id}`} state={{ rate: true }}>
            <Star className="size-4" />
            เขียนรีวิว
          </Button>
        ) : null}
      </div>
    </article>
  )
}
