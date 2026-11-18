import { useEffect, useRef } from 'react'
import { Eraser } from 'lucide-react'

/**
 * R4 customer signature: draw with a finger, pen or mouse; "ล้าง" clears it. The drawing is never saved —
 * `onChange(hasInk)` only tells the screen whether something was signed.
 */
export default function SignaturePad({ hasInk, onChange }) {
  const canvas = useRef(null)
  const last = useRef(null)

  useEffect(() => {
    // Match the canvas bitmap to its CSS size so strokes stay sharp on high-density screens.
    const element = canvas.current
    const ratio = window.devicePixelRatio || 1
    element.width = element.offsetWidth * ratio
    element.height = element.offsetHeight * ratio
    const context = element.getContext('2d')
    context.scale(ratio, ratio)
    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = getComputedStyle(element).color
  }, [])

  const point = (event) => {
    const box = canvas.current.getBoundingClientRect()
    return { x: event.clientX - box.left, y: event.clientY - box.top }
  }
  const draw = (event) => {
    if (!last.current) return
    const next = point(event)
    const context = canvas.current.getContext('2d')
    context.beginPath()
    context.moveTo(last.current.x, last.current.y)
    context.lineTo(next.x, next.y)
    context.stroke()
    last.current = next
    if (!hasInk) onChange(true)
  }
  const clear = () => {
    const element = canvas.current
    element.getContext('2d').clearRect(0, 0, element.width, element.height)
    onChange(false)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span id="signature-label" className="text-sm font-semibold">
          ลายเซ็นลูกค้า
        </span>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className="flex min-h-9 items-center gap-1 rounded-xl px-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-admin"
        >
          <Eraser className="size-4" aria-hidden="true" />
          ล้าง
        </button>
      </div>
      <canvas
        ref={canvas}
        role="img"
        aria-labelledby="signature-label"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          last.current = point(event)
        }}
        onPointerMove={draw}
        onPointerUp={() => (last.current = null)}
        onPointerCancel={() => (last.current = null)}
        className="h-36 w-full touch-none rounded-xl border-2 border-dashed border-neutral-300 bg-surface text-ink"
      />
      {!hasInk && <p className="mt-1 text-xs text-neutral-500">ให้ลูกค้าเซ็นในกรอบด้านบน</p>}
    </div>
  )
}
