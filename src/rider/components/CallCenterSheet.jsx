import { useEffect, useRef, useState } from 'react'
import { Headset, LoaderCircle } from 'lucide-react'
import BottomSheet from '@/shared/components/BottomSheet'
import Button from '@/shared/components/Button'
import { CALL_CENTER_MS, CANCEL_REASONS } from '@/state/orders'

/**
 * R4 — contact Call Center to cancel a job (simulated: no call is made). The rider picks a problem,
 * Call Center "checks" for CALL_CENTER_MS, then `onCancel(reason)` cancels the whole order.
 * Closing the sheet before that keeps the job.
 */
export default function CallCenterSheet({ open, onClose, onCancel }) {
  const [reason, setReason] = useState(null)
  const [checking, setChecking] = useState(false)
  // The parent re-renders every second (order clock); keep its latest callback without restarting the wait.
  const cancel = useRef(onCancel)
  useEffect(() => {
    cancel.current = onCancel
  })

  useEffect(() => {
    if (!checking) return
    const timer = setTimeout(() => cancel.current(reason), CALL_CENTER_MS)
    return () => clearTimeout(timer)
  }, [checking, reason])

  const close = () => {
    setChecking(false)
    setReason(null)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="ติดต่อ Call Center"
      footer={
        <Button block size="lg" disabled={!reason || checking} onClick={() => setChecking(true)}>
          {checking ? (
            <>
              <LoaderCircle className="size-5 motion-safe:animate-spin" aria-hidden="true" />
              Call Center กำลังตรวจสอบ…
            </>
          ) : (
            'ขอยกเลิกงาน'
          )}
        </Button>
      }
    >
      <p className="flex gap-3 rounded-2xl bg-surface p-3 text-sm leading-6 text-neutral-600">
        <Headset className="mt-0.5 size-5 shrink-0 text-brand-dark" aria-hidden="true" />
        แจ้งปัญหาให้ Call Center ยกเลิกงานนี้ ออเดอร์ของลูกค้าจะถูกยกเลิก และไม่นับเป็นรายได้
      </p>
      <fieldset className="mt-4" disabled={checking}>
        <legend className="mb-2 text-sm font-semibold">ปัญหาที่พบ</legend>
        <div className="divide-y divide-neutral-100">
          {CANCEL_REASONS.map((item) => (
            <label key={item} className="flex min-h-12 items-center gap-3 text-sm">
              <input
                type="radio"
                name="cancel-reason"
                value={item}
                checked={reason === item}
                onChange={() => setReason(item)}
                className="size-5 accent-brand-dark"
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="sr-only" aria-live="polite">
        {checking ? 'Call Center กำลังตรวจสอบ' : ''}
      </p>
    </BottomSheet>
  )
}
