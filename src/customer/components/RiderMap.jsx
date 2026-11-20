import { useEffect, useState } from 'react'
import { House, Motorbike } from 'lucide-react'
import { deliveryLeg } from '@/state/orders'
import { MAP_HEIGHT, MAP_WIDTH, ROADS, ROUTE, splitRoute } from './riderRoute'

const toPoints = (points) => points.map((point) => point.join(',')).join(' ')
const percent = ([x, y]) => ({ left: `${(x / MAP_WIDTH) * 100}%`, top: `${(y / MAP_HEIGHT) * 100}%` })

/** Re-renders every animation frame while mounted, unless the viewer prefers reduced motion. */
function useFrameNow() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let frame = requestAnimationFrame(function tick() {
      setNow(Date.now())
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  return now
}

/**
 * C10 mock map while the rider rides to the customer (stage 4): the route ahead is highlighted, the
 * motorbike moves along it and the chip shows the distance left. Not a real map — drawn for the mockup.
 * `now` is the screen's order clock; the map animates between its ticks on its own.
 */
export default function RiderMap({ order, now, distanceKm }) {
  const frameNow = useFrameNow()
  // Frames pause in background tabs, so never fall behind the screen clock; near the end of the ride a frame
  // can reach the next stage before the screen does, so keep the clock's leg until the screen switches.
  const leg =
    deliveryLeg(order, Math.max(frameNow ?? 0, now), distanceKm) || deliveryLeg(order, now, distanceKm)
  if (!leg) return null
  const { point, ahead } = splitRoute(ROUTE, leg.progress)
  return (
    <div
      role="img"
      aria-label={`แผนที่จำลอง ไรเดอร์ห่างจากคุณ ${leg.km} กม.`}
      className="relative aspect-[8/5] overflow-hidden rounded-xl bg-neutral-200"
    >
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <rect x="60" y="58" width="46" height="48" rx="6" className="fill-success-light" />
        <rect x="226" y="0" width="48" height="34" rx="6" className="fill-info-light" />
        <g className="fill-none stroke-white" strokeLinecap="round">
          {ROADS.map((road) => (
            <polyline key={toPoints(road)} points={toPoints(road)} strokeWidth="9" />
          ))}
        </g>
        <polyline
          points={toPoints(ROUTE)}
          className="fill-none stroke-neutral-300"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g className="fill-none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={toPoints(ahead)} className="stroke-brand-dark" strokeWidth="8" />
          <polyline points={toPoints(ahead)} className="stroke-brand" strokeWidth="5" />
        </g>
      </svg>
      <span
        className="absolute -translate-x-1/2 -translate-y-full text-ink"
        style={percent(ROUTE.at(-1))}
        aria-hidden="true"
      >
        <span className="absolute -bottom-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-ink/20 motion-safe:animate-ping" />
        <span className="relative grid size-8 place-items-center rounded-full rounded-br-none bg-ink text-white shadow-md rotate-45">
          <House className="size-4 -rotate-45" />
        </span>
      </span>
      <span
        className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-ink shadow-md ring-3 ring-white"
        style={percent(point)}
        aria-hidden="true"
      >
        <Motorbike className="size-5" />
      </span>
      <span className="absolute left-2 top-2 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
        ห่างจากคุณ {leg.km} กม.
      </span>
    </div>
  )
}
