import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'

/**
 * Sticky header for inner screens: back button + centered title + optional right slot.
 * Back goes to `backTo` if given, otherwise one step back in history.
 */
export default function TopBar({ title, backTo, right, transparent = false }) {
  const navigate = useNavigate()
  return (
    <header
      className={`sticky top-0 z-20 grid h-14 shrink-0 grid-cols-[3rem_1fr_3rem] items-center px-1 ${
        transparent ? '' : 'border-b border-neutral-100 bg-white'
      }`}
    >
      <button
        type="button"
        aria-label="ย้อนกลับ"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className={`grid size-10 place-items-center rounded-full ${transparent ? 'bg-white/90 shadow' : 'hover:bg-neutral-100'}`}
      >
        <ChevronLeft className="size-6" />
      </button>
      <h1 className="truncate text-center text-base font-semibold">{title}</h1>
      <div className="flex justify-end">{right}</div>
    </header>
  )
}
