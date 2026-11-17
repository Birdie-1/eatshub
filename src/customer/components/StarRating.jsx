import { Star } from 'lucide-react'

/**
 * Five stars with halves (4.5 → ★★★★½). Decorative: put the number next to it as text.
 * `className` sizes each star (default size-4).
 */
export default function StarRating({ value, className = 'size-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)) // 0, 0.5 or 1 for our data
        return (
          <span key={i} className="relative inline-flex">
            <Star className={`${className} fill-neutral-200 text-neutral-200`} />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${className} fill-brand text-brand`} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
