import { Link } from 'react-router'
import { formatBaht } from '@/shared/lib/format'
import { useCart } from '@/state'

/**
 * C6 floating cart bar: "2 รายการอาหาร | 215 ฿ · ดูตะกร้า 🧺", shown only when the cart has food.
 * Amounts come from `totals` (calcTotals), the same numbers the cart screen shows.
 *
 * Default: sticks to the bottom of the phone — put it as the last child of the screen.
 * `inline`: plain block with no sticky positioning, for a parent that is already sticky
 * (TabLayout stacks it on top of the bottom nav).
 */
export default function FloatingCartBar({ inline = false }) {
  const { totals } = useCart()
  if (totals.itemCount === 0) return null

  return (
    <div className={`px-3 pt-2 pb-3 ${inline ? '' : 'sticky bottom-0 z-20 mt-auto'}`}>
      <Link
        to="/app/cart"
        className="flex h-13 items-center justify-between gap-3 rounded-2xl bg-brand px-4 shadow-lg ring-1 ring-brand-dark/20 transition-colors active:bg-brand-dark"
      >
        <span className="flex min-w-0 items-center gap-2 text-sm">
          <span className="font-semibold">{totals.itemCount} รายการอาหาร</span>
          <span aria-hidden className="h-4 w-px bg-ink/30" />
          <span className="font-bold">{formatBaht(totals.food)}</span>
        </span>
        <span className="shrink-0 font-semibold">
          ดูตะกร้า <span aria-hidden>🧺</span>
        </span>
      </Link>
    </div>
  )
}
