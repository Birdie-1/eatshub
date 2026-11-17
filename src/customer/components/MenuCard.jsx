import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import { formatBaht } from '@/shared/lib/format'

/**
 * Menu items on the restaurant page (C4). Both open C5 for that item — the "เพิ่ม" / + is part of
 * the link (not a separate button) so every item goes through the same menu-detail flow.
 * `qty` = how many of this item are already in the cart (shows a "×2" badge on the photo).
 */

const menuPath = (menu) => `/app/restaurant/${menu.restaurantId}/menu/${menu.id}`

function QtyBadge({ qty }) {
  if (!qty) return null
  return (
    <span className="absolute top-1.5 left-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-xs font-bold text-white">
      <span className="sr-only">ในตะกร้า </span>×{qty}
    </span>
  )
}

/** Large card in the horizontal "เมนูแนะนำ" row. */
export function FeaturedMenuCard({ menu, qty }) {
  return (
    <Link
      to={menuPath(menu)}
      className="flex w-40 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition-colors active:bg-neutral-50"
    >
      <span className="relative block">
        <img src={menu.image} alt="" loading="lazy" className="aspect-[4/3] w-full bg-surface object-cover" />
        <QtyBadge qty={qty} />
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="truncate font-semibold">{menu.name}</span>
        <span className="line-clamp-2 min-h-9 text-xs leading-[18px] text-muted">{menu.description}</span>
        <span className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="font-bold">{formatBaht(menu.price)}</span>
          <span className="rounded-xl bg-brand px-3 py-1 text-sm font-semibold">เพิ่ม</span>
        </span>
      </span>
    </Link>
  )
}

/** Row with a small square photo, used under each menu section heading. */
export function MenuRow({ menu, qty }) {
  return (
    <Link to={menuPath(menu)} className="flex gap-3 py-3 transition-colors active:bg-neutral-50">
      <span className="relative shrink-0">
        <img src={menu.image} alt="" loading="lazy" className="size-20 rounded-xl bg-surface object-cover" />
        <QtyBadge qty={qty} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{menu.name}</span>
        <span className="line-clamp-2 text-xs text-muted">{menu.description}</span>
        <span className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span className="font-bold">{formatBaht(menu.price)}</span>
          <span className="grid size-8 place-items-center rounded-full bg-brand">
            <Plus className="size-5" strokeWidth={2.5} aria-hidden />
            <span className="sr-only">เพิ่ม</span>
          </span>
        </span>
      </span>
    </Link>
  )
}
