/**
 * Header for the rider app's tab screens (R5 wallet, R6 income, R7 account). The bottom tabs do the
 * navigating, so unlike `TopBar` on inner screens there is no back button. `children` go on the right.
 */
export default function RiderTabHeader({ title, children }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-neutral-100 bg-white px-4">
      <h1 className="text-lg font-bold">{title}</h1>
      {children}
    </header>
  )
}
