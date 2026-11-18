import Card from '@/shared/components/Card'
import { formatAmount } from '@/shared/lib/format'
import { formatChoices } from '@/state'
import PriceBreakdown from './PriceBreakdown'

export default function OrderSummary({ items, totals, notes, restaurant, coupon }) {
  return (
    <Card className="space-y-4 border border-neutral-100 shadow-none">
      <div>
        <h2 className="font-semibold">รายละเอียดออเดอร์</h2>
        <p className="mt-1 text-sm text-neutral-500">{restaurant.name}</p>
      </div>
      <ul className="divide-y divide-neutral-100">
        {items.map((item) => (
          <li key={item.key} className="flex gap-3 py-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-light text-xs font-semibold">
              {item.qty}×
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{formatChoices(item)}</p>
              {item.note && <p className="text-xs text-neutral-500">หมายเหตุ: {item.note}</p>}
              <p className="mt-1 text-[11px] text-neutral-400">{formatAmount(item.unitPrice)} ฿ / รายการ</p>
            </div>
            <span className="whitespace-nowrap text-sm">{formatAmount(item.lineTotal)} ฿</span>
          </li>
        ))}
      </ul>
      {notes?.noteToStore && (
        <p className="rounded-xl bg-neutral-50 p-3 text-xs leading-6">
          <strong>หมายเหตุถึงร้าน:</strong> {notes.noteToStore}
        </p>
      )}
      {notes?.noteToRider && (
        <p className="rounded-xl bg-neutral-50 p-3 text-xs leading-6">
          <strong>หมายเหตุถึงไรเดอร์:</strong> {notes.noteToRider}
        </p>
      )}
      <div className="space-y-4 border-t border-neutral-100 pt-4">
        <PriceBreakdown totals={totals} restaurant={restaurant} coupon={coupon} />
      </div>
    </Card>
  )
}
