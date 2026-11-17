import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { LogOut, Menu, X } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import { adminMenu } from '@/admin/layouts/adminMenu'

/**
 * Back-office shell (A2): white header, dark sidebar, yellow footer.
 * Below lg the sidebar collapses behind a ☰ button.
 */
export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(id)
  }, [toast])

  return (
    <div className="flex min-h-full flex-col bg-neutral-100">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="เมนู"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <Logo className="size-10 rounded-lg" />
          <span className="text-lg font-bold tracking-tight">eatsHUB</span>
        </div>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900">
          <LogOut className="size-4" />
          ออกจากระบบ
        </Link>
      </header>

      <div className="relative flex flex-1">
        <aside
          className={`absolute inset-y-0 left-0 z-10 w-64 bg-admin text-neutral-300 transition-transform lg:static lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-white/10 px-5 py-4">
            <p className="font-semibold text-white">Restaurant Admin</p>
            <p className="flex items-center gap-1.5 text-xs">
              <span className="size-2 rounded-full bg-status-online" /> Online
            </p>
          </div>
          <nav className="flex flex-col py-2">
            {adminMenu.map(({ label, icon: Icon, to }) =>
              to ? (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 text-sm ${
                      isActive ? 'bg-brand font-semibold text-neutral-900' : 'hover:bg-admin-dark'
                    }`
                  }
                >
                  <Icon className="size-5" /> {label}
                </NavLink>
              ) : (
                <button
                  key={label}
                  type="button"
                  onClick={() => setToast('ไม่อยู่ในขอบเขต Mockup')}
                  className="flex items-center gap-3 px-5 py-2.5 text-left text-sm hover:bg-admin-dark"
                >
                  <Icon className="size-5" /> {label}
                </button>
              ),
            )}
          </nav>
        </aside>

        {open && (
          <div className="absolute inset-0 z-[5] bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
        )}

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <footer className="bg-brand px-4 py-3 text-center text-sm text-neutral-900">
        Copyright © 2026 EatsHub. All rights reserved.
      </footer>

      {toast && (
        <div className="fixed bottom-16 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
