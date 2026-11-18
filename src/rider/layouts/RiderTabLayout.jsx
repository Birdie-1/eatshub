import { useLayoutEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { ChartColumn, House, User, Wallet } from 'lucide-react'

const tabs = [
  { to: '/rider', label: 'หน้าแรก', icon: House, end: true },
  { to: '/rider/wallet', label: 'กระเป๋าเงิน', icon: Wallet },
  { to: '/rider/income', label: 'รายได้', icon: ChartColumn },
  { to: '/rider/account', label: 'บัญชี', icon: User },
]

/** Rider screens with the dark 4-tab bottom navigation from the spec (selected tab is yellow). */
export default function RiderTabLayout() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    document.getElementById('phone-scroll')?.scrollTo({ top: 0 })
  }, [pathname])
  return (
    <>
      <main className="flex-1">
        <Outlet />
      </main>
      <nav
        aria-label="เมนูแอปไรเดอร์"
        className="sticky bottom-0 z-20 grid grid-cols-4 bg-admin pb-[env(safe-area-inset-bottom)]"
      >
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 text-xs focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${isActive ? 'text-brand' : 'text-neutral-400'}`
            }
          >
            <Icon className="size-6" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
