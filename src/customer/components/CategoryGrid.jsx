import { useState } from 'react'
import { Link } from 'react-router'
import {
  Beef,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Coffee,
  CookingPot,
  Croissant,
  CupSoda,
  EggFried,
  Fish,
  Flame,
  Globe,
  Hamburger,
  IceCreamCone,
  Pizza,
  Salad,
  Shrimp,
  Soup,
  Store,
  Sunrise,
  UtensilsCrossed,
} from 'lucide-react'
import { categories } from '@/data/restaurants'

const icons = {
  Beef,
  ChefHat,
  Coffee,
  CookingPot,
  Croissant,
  CupSoda,
  EggFried,
  Fish,
  Flame,
  Globe,
  Hamburger,
  IceCreamCone,
  Pizza,
  Salad,
  Shrimp,
  Soup,
  Store,
  Sunrise,
  UtensilsCrossed,
}

/** Bright flat tiles; class strings are spelled out so Tailwind keeps them. */
const colors = {
  sky: 'bg-sky-100 text-sky-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  amber: 'bg-amber-100 text-amber-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  pink: 'bg-pink-100 text-pink-600',
  red: 'bg-red-100 text-red-600',
  violet: 'bg-violet-100 text-violet-600',
  rose: 'bg-rose-100 text-rose-600',
  green: 'bg-green-100 text-green-600',
}

const COLLAPSED = 8 // 2 rows of 4

/** 4-column category grid (C2). Shows 2 rows, "ดูเพิ่มเติม" expands all 19. Tap → /app/search?cat=id */
export default function CategoryGrid() {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? categories : categories.slice(0, COLLAPSED)

  return (
    <section aria-label="หมวดอาหาร" className="px-4">
      <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
        {shown.map((c) => {
          const Icon = icons[c.icon] ?? UtensilsCrossed
          return (
            <li key={c.id}>
              <Link
                to={`/app/search?cat=${c.id}`}
                className="flex flex-col items-center gap-1.5 rounded-xl text-center active:opacity-70"
              >
                <span className={`grid size-14 place-items-center rounded-2xl ${colors[c.color]}`}>
                  <Icon className="size-7" strokeWidth={1.75} />
                </span>
                <span className="text-xs leading-tight">{c.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="mx-auto mt-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-neutral-100"
      >
        {expanded ? 'แสดงน้อยลง' : 'ดูเพิ่มเติม'}
        {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
    </section>
  )
}
