import { useEffect, useSyncExternalStore } from 'react'

/**
 * Tiny global toast. Call `toast('ข้อความ')` from anywhere (no hook needed);
 * the nearest mounted <Toaster /> shows it for 2 seconds.
 * PhoneFrame and AdminLayout each mount one, so it stays inside the phone on desktop.
 */
export const OUT_OF_SCOPE = 'ไม่อยู่ในขอบเขต Mockup'

let current = null
const listeners = new Set()

function emit(next) {
  current = next
  listeners.forEach((l) => l())
}

export function toast(message) {
  emit({ id: Date.now(), message })
}

/** Use on buttons that intentionally go nowhere in the mockup. */
export function notInScope() {
  toast(OUT_OF_SCOPE)
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** `fixed` positions to the window (back office); default `absolute` stays inside the phone frame. */
export function Toaster({ fixed = false }) {
  const item = useSyncExternalStore(subscribe, () => current)

  useEffect(() => {
    if (!item) return
    const id = setTimeout(() => emit(null), 2000)
    return () => clearTimeout(id)
  }, [item])

  if (!item) return null
  return (
    <div
      role="status"
      key={item.id}
      className={`${fixed ? 'fixed' : 'absolute'} bottom-24 left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-xl bg-ink/90 px-4 py-2.5 text-center text-sm text-white shadow-lg`}
    >
      {item.message}
    </div>
  )
}
