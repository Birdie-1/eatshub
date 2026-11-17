const whole = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const fixed2 = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Prices in lists/cards: 215 → "215 ฿", 187.4 → "187.4 ฿" */
export function formatBaht(amount) {
  return `${whole.format(amount)} ฿`
}

const shortDate = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

/** Dates like reviews: "2026-11-12" → "12 พ.ย. 2569" (Thai month, Buddhist year) */
export function formatDate(isoDate) {
  return shortDate.format(new Date(`${isoDate}T00:00:00`))
}

/** Amounts in order summaries: 215 → "215.00", 1234.5 → "1,234.50" (add " ฿" yourself where the design shows it) */
export function formatAmount(amount) {
  return fixed2.format(amount)
}
