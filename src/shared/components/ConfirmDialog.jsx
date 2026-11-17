import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

/**
 * Centered yes/no dialog. Like BottomSheet it renders into the phone frame (#phone-frame)
 * so it stays inside the phone on desktop. Escape or tapping the backdrop cancels.
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'ตกลง',
  cancelLabel = 'ยกเลิก',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCancel?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const host = document.getElementById('phone-frame')
  const position = host ? 'absolute' : 'fixed'

  return createPortal(
    <div className={`${position} inset-0 z-50 flex items-center justify-center p-6`}>
      <div className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-black/40" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative flex w-full max-w-sm animate-[fade-in_150ms_ease-out] flex-col gap-2 rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        {children && <div className="text-sm text-muted">{children}</div>}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    host ?? document.body,
  )
}
