import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { categories } from '@/data/restaurants'

/**
 * Category icons: Microsoft Fluent Emoji, 3D style (MIT, see icons/categories/LICENSE).
 * One 128px PNG per category, named by category id.
 */
const iconFiles = import.meta.glob('@/shared/assets/icons/categories/*.png', {
  eager: true,
  import: 'default',
})
const iconFor = (id) => iconFiles[`/src/shared/assets/icons/categories/${id}.png`]

const COLLAPSED = 8 // 2 rows of 4

/** 4-column category grid (C2). Shows 2 rows, "ดูเพิ่มเติม" expands all 19. Tap → /app/search?cat=id */
export default function CategoryGrid() {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? categories : categories.slice(0, COLLAPSED)

  return (
    <section aria-label="หมวดอาหาร" className="px-4">
      <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
        {shown.map((c) => (
          <li key={c.id}>
            <Link
              to={`/app/search?cat=${c.id}`}
              className="flex flex-col items-center gap-1.5 rounded-xl text-center active:opacity-70"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-light/60">
                <img src={iconFor(c.id)} alt="" className="size-10" draggable={false} />
              </span>
              <span className="text-xs leading-tight">{c.name}</span>
            </Link>
          </li>
        ))}
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
