import { describe, expect, it } from 'vitest'
import { formatAmount, formatBaht, formatDate } from './format'

describe('formatDate', () => {
  it('uses Thai short months and the Buddhist year', () => {
    expect(formatDate('2026-11-12')).toBe('12 พ.ย. 2569')
  })
})

describe('formatBaht', () => {
  it('shows whole baht with the symbol after the number', () => {
    expect(formatBaht(215)).toBe('215 ฿')
    expect(formatBaht(1500)).toBe('1,500 ฿')
  })
})

describe('formatAmount', () => {
  it('always shows two decimals', () => {
    expect(formatAmount(215)).toBe('215.00')
    expect(formatAmount(187.4)).toBe('187.40')
    expect(formatAmount(1234.5)).toBe('1,234.50')
  })
})
