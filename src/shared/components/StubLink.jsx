import { Link } from 'react-router'

/** Navigation button used inside ScreenStub so the flow is clickable before screens exist. */
export default function StubLink({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-brand-dark"
    >
      {children}
    </Link>
  )
}
