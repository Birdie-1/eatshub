import { useRef, useState } from 'react'
import { ChevronUp } from 'lucide-react'

const DRAG_DISTANCE = 24 // px of vertical drag on the handle that opens/closes the sheet

/**
 * R2 pull-up sheet that stays docked at the bottom of the home map (not a modal, so it doesn't use
 * BottomSheet). Drag the handle up/down, or click / press Enter or Space on it; Escape closes it.
 * `peek` shows while collapsed; `children` show when expanded.
 */
export default function StatsSheet({ title, peek, children }) {
  const [open, setOpen] = useState(false)
  const handle = useRef(null)
  const dragStart = useRef(null)
  const dragged = useRef(false)
  return (
    <section
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false)
          handle.current?.focus()
        }
      }}
      className="absolute inset-x-0 bottom-0 z-20 flex max-h-[85%] flex-col rounded-t-3xl bg-white shadow-[0_-8px_24px_rgb(0_0_0/0.12)]"
    >
      <button
        ref={handle}
        type="button"
        aria-expanded={open}
        aria-controls="rider-stats"
        onPointerDown={(event) => {
          // Keep receiving pointerup after the finger/mouse leaves the handle.
          event.currentTarget.setPointerCapture(event.pointerId)
          dragStart.current = event.clientY
          dragged.current = false
        }}
        onPointerUp={(event) => {
          if (dragStart.current == null) return
          const distance = event.clientY - dragStart.current
          dragStart.current = null
          if (Math.abs(distance) < DRAG_DISTANCE) return
          dragged.current = true
          setOpen(distance < 0)
        }}
        onPointerCancel={() => (dragStart.current = null)}
        onClick={() => {
          if (dragged.current) dragged.current = false
          else setOpen((value) => !value)
        }}
        className="flex w-full touch-none flex-col items-center gap-1 rounded-t-3xl px-5 pb-2 pt-2.5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-admin"
      >
        <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-neutral-300" />
        <span className="flex w-full items-center justify-between text-base font-semibold">
          {title}
          <ChevronUp
            aria-hidden="true"
            className={`size-5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
        {!open && peek && <span className="w-full text-left text-sm text-neutral-500">{peek}</span>}
      </button>
      <div
        id="rider-stats"
        inert={!open}
        className={`grid min-h-0 transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-y-auto">
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </section>
  )
}
