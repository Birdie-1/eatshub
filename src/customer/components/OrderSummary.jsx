import { Coins } from 'lucide-react'
import Card from '@/shared/components/Card'
import { formatAmount } from '@/shared/lib/format'
import { formatChoices } from '@/state'

export default function OrderSummary({ items, totals, notes, restaurant, compact = false }) {
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
              {!compact && (
                <>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{formatChoices(item)}</p>
                  {item.note && <p className="text-xs text-neutral-500">หมายเหตุ: {item.note}</p>}
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {formatAmount(item.unitPrice)} ฿ / รายการ
                  </p>
                </>
              )}
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
      <dl className="space-y-2 border-t border-neutral-100 pt-4 text-sm">
        {[
          ['ค่าอาหารรวม', totals.food],
          ['ค่าจัดส่ง', totals.delivery],
          ...(totals.storeDiscount ? [['ส่วนลดร้าน', -totals.storeDiscount]] : []),
          ...(totals.couponDiscount ? [['ส่วนลดคูปอง', -totals.couponDiscount]] : []),
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-neutral-500">{label}</dt>
            <dd className={value < 0 ? 'text-success' : ''}>{formatAmount(value)} ฿</dd>
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
    </Card>
  )
}
