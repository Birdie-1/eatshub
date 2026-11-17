import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Slide-up sheet. Renders into the phone frame (#phone-frame) so it stays inside the phone
 * on desktop; falls back to the window when used outside the customer app.
 */
export default function BottomSheet({ open, onClose, title, footer, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const host = document.getElementById('phone-frame')
  const position = host ? 'absolute' : 'fixed'

  return createPortal(
    <div className={`${position} inset-0 z-40 flex flex-col justify-end`}>
      <div className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[85%] animate-[sheet-up_200ms_ease-out] flex-col rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="ปิด"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full hover:bg-neutral-100"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-neutral-100 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    host ?? document.body,
  )
}
