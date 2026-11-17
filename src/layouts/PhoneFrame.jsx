import { Outlet } from 'react-router'

/**
 * Customer app shell.
 * Phones (< md): full screen. Desktop: app centered inside a phone-shaped frame.
 * Screens render into a scrollable column; fixed UI (bottom nav, floating cart bar)
 * should use `sticky`/`absolute` inside this frame, never `fixed`, so it stays in the phone.
 */
export default function PhoneFrame() {
  return (
    <div className="flex min-h-full items-center justify-center md:bg-neutral-800 md:py-8">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-white md:h-[min(844px,calc(100dvh-4rem))] md:w-[390px] md:rounded-[48px] md:border-[12px] md:border-neutral-950 md:shadow-2xl">
        <div id="phone-scroll" className="flex flex-1 flex-col overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
