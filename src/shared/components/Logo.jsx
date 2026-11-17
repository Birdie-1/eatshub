import logo from '@brand/logo.svg'
import logoTransparent from '@brand/logo-transparent.svg'

/**
 * eatsHub mark. `variant="tile"` = yellow square (default),
 * `variant="mark"` = white artwork only, for use on yellow/dark backgrounds.
 */
export default function Logo({ variant = 'tile', className = 'size-16' }) {
  const src = variant === 'mark' ? logoTransparent : logo
  return <img src={src} alt="eatsHub" className={className} />
}
