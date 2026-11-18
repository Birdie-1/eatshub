import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, MapPin, Store } from 'lucide-react'
import Button from '@/shared/components/Button'
import { formatAmount } from '@/shared/lib/format'
import { RIDER_EARNING } from '@/data/riderProfile'
import { getRestaurant } from '@/data/restaurants'
import { JOB_OFFER_MS } from '@/state/orders'

const RING = 2 * Math.PI * 26 // circumference of the countdown ring (r = 26)

function Countdown({ seconds }) {
  return (
    <div className="relative grid size-16 shrink-0 place-items-center" role="timer" aria-live="off">
      <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="30" cy="30" r="26" fill="none" strokeWidth="5" className="stroke-neutral-100" />
        <circle
          cx="30"
          cy="30"
          r="26"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={RING}
          strokeDashoffset={RING * (1 - seconds / (JOB_OFFER_MS / 1000))}
          className="stroke-brand transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="text-lg font-bold">
        {seconds}
        <span className="sr-only"> วินาที</span>
      </span>
    </div>
  )
}

/**
 * R3 — new job popup over the rider home. Shows the rider's earning, distance and food cost, the pickup
 * (restaurant) and drop-off (order address), with a 45-second countdown and one "รับงาน" button.
 * `auto` shows the "รับงานใหม่อัตโนมัติแล้ว" version for jobs taken by auto-accept. There is no reject
 * button (out of scope); Escape or the backdrop only closes the popup — the offer runs out on its own.
 */
export default function JobOfferDialog({ order, now, auto = false, onAccept, onDismiss }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onDismiss()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  const seconds = Math.max(0, Math.ceil((Date.parse(order.jobOfferExpiresAt) - now) / 1000))
  const distance = getRestaurant(order.restaurant.id)?.distanceKm
  const facts = [
    ['รายได้', `${formatAmount(RIDER_EARNING)} ฿`],
    ['ระยะทาง', distance == null ? '–' : `${distance} กม.`],
    ['ค่าอาหาร', `${formatAmount(order.totals.food)} ฿`],
  ]
  const host = document.getElementById('phone-frame')

  return createPortal(
    <div className={`${host ? 'absolute' : 'fixed'} inset-0 z-50 flex items-end justify-center p-4`}>
      <div className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-black/40" onClick={onDismiss} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-offer-title"
        className="relative w-full max-w-sm animate-[sheet-up_200ms_ease-out] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center gap-3">
          {auto ? (
            <CircleCheck className="size-12 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <Countdown seconds={seconds} />
          )}
          <div className="min-w-0">
            <h2 id="job-offer-title" className="text-lg font-semibold">
              {auto ? 'รับงานใหม่อัตโนมัติแล้ว ✓' : 'งานใหม่'}
            </h2>
            <p className="break-all text-xs text-neutral-500">{order.id}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {facts.map(([label, value]) => (
            <div key={label} className="flex flex-col-reverse rounded-xl bg-surface px-1 py-2">
              <dt className="text-[11px] text-neutral-500">{label}</dt>
              <dd className="text-base font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <Store className="mt-0.5 size-5 shrink-0 text-brand-dark" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">จุดรับ</p>
              <p className="font-medium">{order.restaurant.name}</p>
              <p className="text-xs leading-5 text-neutral-500">{order.restaurant.address}</p>
            </div>
          </li>
          <li className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">จุดส่ง</p>
              <p className="font-medium">ลูกค้า · {order.address.label}</p>
              <p className="text-xs leading-5 text-neutral-500">{order.address.detail}</p>
            </div>
          </li>
        </ol>

        <Button block size="lg" className="mt-5" onClick={onAccept} autoFocus>
          {auto ? 'เริ่มงาน' : 'รับงาน'}
        </Button>
      </div>
    </div>,
    host ?? document.body,
  )
}
