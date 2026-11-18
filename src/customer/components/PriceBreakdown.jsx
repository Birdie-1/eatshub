import { Coins } from 'lucide-react'
import { formatAmount } from '@/shared/lib/format'

/**
 * Price lines + total + points, read straight from `calcTotals` output (never recomputed here).
 * Discount rows appear only when they apply. `restaurant.offer.percent` and `coupon` only label them.
 */
export default function PriceBreakdown({ totals, restaurant, coupon }) {
  const percent = restaurant?.offer?.percent
  const rows = [
    ['ค่าอาหารรวม', totals.food],
    ['ค่าจัดส่ง', totals.delivery],
    ...(totals.storeDiscount
      ? [[percent ? `ส่วนลดร้าน (${percent}%)` : 'ส่วนลดร้าน', -totals.storeDiscount]]
      : []),
    ...(totals.couponDiscount ? [[coupon ? `คูปอง ${coupon}` : 'ส่วนลดคูปอง', -totals.couponDiscount]] : []),
  ]
  return (
    <>
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-neutral-500">{label}</dt>
            <dd className={value < 0 ? 'text-success' : ''}>
              {value < 0 ? `−${formatAmount(-value)}` : formatAmount(value)} ฿
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-dashed border-neutral-200 pt-3 font-semibold">
          <dt>ยอดรวมคำสั่งซื้อ</dt>
          <dd data-testid="order-total" className="text-lg">
            {formatAmount(totals.total)} ฿
          </dd>
        </div>
      </dl>
      <p className="flex items-center gap-2 rounded-xl bg-brand-light p-3 text-xs">
        <Coins className="size-4 text-brand-dark" />
        คุณจะได้รับ {totals.points} คะแนน
      </p>
    </>
  )
}
