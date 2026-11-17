import { Link } from 'react-router'

const variants = {
  primary: 'bg-brand text-ink hover:bg-brand-dark active:bg-brand-dark',
  secondary: 'border border-brand bg-white text-brand-dark hover:bg-brand-light',
  ghost: 'text-ink hover:bg-neutral-100',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-12 px-5 text-base',
}

/**
 * App-wide button (all buttons use rounded-xl).
 * Pass `to` to render a router <Link> instead of a <button>.
 * `block` makes it full width.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  to,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40 ${
    variants[variant]
  } ${sizes[size]} ${block ? 'w-full' : ''} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  )
}
