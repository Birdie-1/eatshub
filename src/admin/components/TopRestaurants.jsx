import Card from '@/shared/components/Card'
import { formatBaht } from '@/shared/lib/format'
import { summarizeTop, topRestaurants } from '@/data/dashboard'

const count = new Intl.NumberFormat('th-TH')
const summary = summarizeTop(topRestaurants)
const leader = topRestaurants[0].sales

/** A5 Top 5 restaurants by report sales; bars are relative to the leader. */
export default function TopRestaurants() {
  return (
    <Card
      as="section"
      aria-labelledby="top-restaurants-title"
      className="min-w-0 border border-neutral-200 shadow-none sm:p-6"
    >
      <h3 id="top-restaurants-title" className="font-semibold">
        ร้านขายดี 5 อันดับ
      </h3>
      <p className="mt-1 text-xs text-neutral-500">รวมกันคิดเป็น {summary.share}% ของยอดขายทั้งปี</p>
      <ol className="mt-5 space-y-4">
        {topRestaurants.map((restaurant, index) => (
          <li key={restaurant.id} className="flex items-center gap-3">
            <span className="w-3 shrink-0 text-xs font-semibold text-neutral-400 tabular-nums">
              {index + 1}
            </span>
            <img
              src={restaurant.image}
              alt=""
              loading="lazy"
              className="size-10 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="truncate text-sm font-medium" title={restaurant.name}>
                  {restaurant.name}
                </h4>
                <p className="shrink-0 text-sm font-semibold tabular-nums">{formatBaht(restaurant.sales)}</p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{ width: `${(restaurant.sales / leader) * 100}%` }}
                  />
                </span>
                <span className="shrink-0 text-[11px] text-neutral-500 tabular-nums">
                  {count.format(restaurant.orders)} ออเดอร์ · {summarizeTop([restaurant]).share}%
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
