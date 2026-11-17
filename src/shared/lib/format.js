const whole = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const fixed2 = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Prices in lists/cards: 215 → "215 ฿", 187.4 → "187.4 ฿" */
export function formatBaht(amount) {
  return `${whole.format(amount)} ฿`
}

/** Amounts in order summaries: 215 → "215.00", 1234.5 → "1,234.50" (add " ฿" yourself where the design shows it) */
export function formatAmount(amount) {
  return fixed2.format(amount)
}
