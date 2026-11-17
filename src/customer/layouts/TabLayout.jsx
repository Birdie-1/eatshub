import { NavLink, Outlet } from 'react-router'
import { ClipboardList, ShoppingCart, User, Utensils } from 'lucide-react'
import { useCart } from '@/state'

const tabs = [
  { to: '/app', label: 'ร้านอาหาร', icon: Utensils, end: true },
  { to: '/app/cart', label: 'ตะกร้า', icon: ShoppingCart },
  { to: '/app/orders', label: 'ออเดอร์', icon: ClipboardList },
  { to: '/app/account', label: 'บัญชี', icon: User },
]

/** Screens with the 4-tab bottom navigation (selected tab is yellow). */
export default function TabLayout() {
  const { totals } = useCart()
  return (
    <>
      <main className="flex-1">
        <Outlet />
      </main>
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 text-xs ${isActive ? 'text-brand-dark' : 'text-neutral-400'}`
            }
          >
            <span className="relative">
              <Icon className="size-6" strokeWidth={1.75} />
              {to === '/app/cart' && totals.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] leading-none font-semibold text-white">
                  {totals.itemCount > 99 ? '99+' : totals.itemCount}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
