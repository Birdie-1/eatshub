import { Star } from 'lucide-react'

/** Tappable 1–5 star picker. `label` names the group for screen readers. */
export default function StarInput({ label, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((stars) => (
        <button
          key={stars}
          type="button"
          role="radio"
          aria-checked={value === stars}
          aria-label={`${stars} ดาว`}
          onClick={() => onChange(stars)}
          className="grid size-11 place-items-center rounded-xl hover:bg-brand-light"
        >
          <Star
            className={`size-8 ${stars <= value ? 'fill-brand text-brand' : 'fill-neutral-100 text-neutral-300'}`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
