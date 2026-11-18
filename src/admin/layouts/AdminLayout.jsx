import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { LogOut, Menu, X, ShieldCheck } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import { Toaster } from '@/shared/components/Toast'
import { useSession } from '@/state'
import { adminMenu } from '@/admin/layouts/adminMenu'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState(null)
  const open = openOn === pathname
  const dialog = useRef(null)
  const menuButton = useRef(null)
  const { signOut } = useSession()
  const navigate = useNavigate()
  const closeMenu = () => setOpenOn(null)
  const logout = () => {
    // Leave the guarded route before clearing its session to avoid competing redirects.
    navigate('/', { replace: true, flushSync: true })
    signOut('admin')
  }

  useEffect(() => {
    if (open) dialog.current?.showModal()
    else if (dialog.current?.open) dialog.current.close()
  }, [open])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const media = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (media.matches) setOpenOn(null)
    }
    media.addEventListener('change', closeOnDesktop)
    return () => {
      document.body.style.overflow = previous
      media.removeEventListener('change', closeOnDesktop)
    }
  }, [open])

  const navigation = (mobile = false) => (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-brand">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Restaurant Admin</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-300">
            <span className="size-1.5 rounded-full bg-status-online" />
            Online
          </p>
        </div>
      </div>
      <p className="px-5 pb-2 pt-6 text-[10px] font-semibold tracking-widest text-neutral-400">
        เมนูจัดการระบบ
      </p>
      <nav aria-label={mobile ? 'เมนูหลังบ้านบนมือถือ' : 'เมนูหลังบ้าน'} className="flex flex-col gap-1 px-3 pb-6">
        {adminMenu.map(({ label, icon: Icon, to, end }) =>
          to ? (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm ${isActive ? 'bg-brand font-semibold text-ink' : 'text-neutral-300 hover:bg-white/5'}`
              }
            >
              <Icon className="size-[18px] shrink-0" />
              {label}
            </NavLink>
          ) : (
            <button
              key={label}
              type="button"
              onClick={logout}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm text-neutral-300 hover:bg-white/5"
            >
              <Icon className="size-[18px] shrink-0" />
              {label}
            </button>
          ),
        )}
      </nav>
    </>
  )

  return (
    <div className="admin-shell min-h-dvh bg-surface">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:p-3"
      >
        ข้ามไปเนื้อหา
      </a>
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            ref={menuButton}
            type="button"
            className="grid size-11 place-items-center rounded-xl text-neutral-600 hover:bg-neutral-100 lg:hidden"
            onClick={() => setOpenOn(pathname)}
            aria-label="เปิดเมนู"
            aria-expanded={open}
            aria-controls="admin-mobile-menu"
          >
            <Menu className="size-6" />
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="size-10 rounded-xl" />
            <span className="text-xl font-bold tracking-tight">
              eatsHub<span className="text-brand-dark">.</span>
            </span>
          </Link>
          <span className="ml-5 hidden border-l border-neutral-200 pl-5 text-sm text-neutral-500 sm:block">
            ระบบหลังบ้าน
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-ink"
        >
          <LogOut className="size-[18px]" />
          <span className="hidden sm:inline">ออกจากระบบ</span>
          <span className="sr-only sm:hidden">ออกจากระบบ</span>
        </button>
      </header>
      <div className="flex min-h-[calc(100dvh-72px)]">
        <aside className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-60 shrink-0 overflow-y-auto bg-admin lg:block">
          {navigation()}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="admin-content" className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 xl:p-8">
            <Outlet />
          </main>
          <footer className="border-t border-brand-dark/10 bg-brand px-4 py-4 text-center text-xs leading-5 text-ink">
            Copyright © 2026 EatsHub. All rights reserved.
          </footer>
        </div>
      </div>
      <dialog
        id="admin-mobile-menu"
        ref={dialog}
        onCancel={closeMenu}
        onClose={() => {
          closeMenu()
          menuButton.current?.focus()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu()
        }}
        aria-labelledby="mobile-menu-title"
        className="admin-drawer fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(300px,calc(100vw-40px))] max-w-none border-0 bg-admin p-0 text-white backdrop:bg-black/50"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
          <h2 id="mobile-menu-title" className="font-semibold">
            ระบบหลังบ้าน
          </h2>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="ปิดเมนู"
            className="grid size-11 place-items-center rounded-xl hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>
        {navigation(true)}
      </dialog>
      <Toaster fixed />
    </div>
  )
}
