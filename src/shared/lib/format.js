const baht = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** 102 → "฿102", 187.4 → "฿187.4" */
export function formatBaht(amount) {
  return `฿${baht.format(amount)}`
}
