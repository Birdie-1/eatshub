const tones = {
  success: 'bg-success-light text-success',
  danger: 'bg-danger-light text-danger',
  warning: 'bg-warning-light text-warning',
  info: 'bg-info-light text-info',
  brand: 'bg-brand-light text-brand-dark',
  neutral: 'bg-neutral-100 text-muted',
}

const solidTones = {
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
  warning: 'bg-warning text-white',
  info: 'bg-info text-white',
  brand: 'bg-brand text-ink',
  neutral: 'bg-muted text-white',
}

/** Status pill. `solid` uses the full color (white text; dark text on brand yellow, e.g. "ร้านแนะนำ"). */
export default function Badge({ tone = 'neutral', solid = false, className = '', children }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
        solid ? solidTones[tone] : tones[tone]
      } ${className}`}
    >
      {children}
    </span>
  )
}
