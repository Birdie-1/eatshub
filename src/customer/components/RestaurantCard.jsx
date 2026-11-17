import { Link } from 'react-router'
import { Heart, Star, TicketPercent } from 'lucide-react'
import Badge from '@/shared/components/Badge'
import { formatBaht } from '@/shared/lib/format'
import { useFavorites } from '@/state'

/**
 * Horizontal restaurant row used on Home (C2) and Search (C3).
 * Top right shows the blue "ร้านแนะนำ" badge for recommended stores, otherwise a ♥ toggle.
 */
export default function RestaurantCard({ restaurant: r }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const liked = isFavorite(r.id)

  return (
    <div className="relative">
      <Link
        to={`/app/restaurant/${r.id}`}
        className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-100 transition-colors active:bg-neutral-50"
      >
        <img
          src={r.image}
          alt=""
          loading="lazy"
          className="size-20 shrink-0 rounded-xl bg-surface object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className={`truncate font-semibold ${r.recommended ? 'pr-18' : 'pr-7'}`}>{r.name}</h3>
          <p className={`truncate text-sm text-muted ${r.recommended ? '' : 'pr-7'}`}>{r.types.join(', ')}</p>
          {r.promo && (
            <p className="flex min-w-0 items-center gap-1 text-xs font-medium text-brand-dark">
              <TicketPercent className="size-3.5 shrink-0" />
              <span className="truncate">{r.promo}</span>
            </p>
          )}
          <p className="mt-auto flex flex-wrap items-center gap-x-1 pt-1 text-xs text-muted">
            <span className="inline-flex items-center gap-0.5 font-medium text-ink">
              <Star className="size-3.5 fill-brand text-brand" />
              {r.rating}/5
            </span>
            <span aria-hidden>·</span>
            <span>ยอดขั้นต่ำ {formatBaht(r.minOrder)}</span>
            <span aria-hidden>·</span>
            <span>ค่าส่ง {formatBaht(r.deliveryFee)}</span>
          </p>
        </div>
      </Link>

      <div className="absolute top-3 right-3">
        {r.recommended ? (
          <Badge tone="info" solid className="px-2 text-[11px]">
            ร้านแนะนำ
          </Badge>
        ) : (
          <button
            type="button"
            aria-label={liked ? 'เลิกถูกใจร้านนี้' : 'ถูกใจร้านนี้'}
            aria-pressed={liked}
            onClick={() => toggleFavorite(r.id)}
            className="-m-1.5 grid size-9 place-items-center rounded-full hover:bg-neutral-100"
          >
            <Heart className={`size-5 ${liked ? 'fill-danger text-danger' : 'text-neutral-300'}`} />
          </button>
        )}
      </div>
    </div>
  )
}
