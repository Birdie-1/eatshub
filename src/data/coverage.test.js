import { provinceOrderRows, provinceOrderTotal, provinceOrderReport } from './coverage'
import { dashboardTotals } from './dashboard'
import { describe, expect, it } from 'vitest'
import { coverageProvinces, coverageTop, provinceShapes, provinceNames } from './coverage'

describe('historical service coverage', () => {
  it('contains 19 unique provinces and explicitly includes Chumphon', () => {
    expect(coverageProvinces).toHaveLength(19)
    expect(new Set(coverageProvinces.map((p) => p.id)).size).toBe(19)
    expect(coverageProvinces.find((p) => p.id === 'th-86')?.name).toBe('ชุมพร')
  })
  it('ranks only covered provinces, in the agreed order', () => {
    expect(coverageTop.map((p) => p.name)).toEqual(['ชุมพร', 'เพชรบุรี', 'พระนครศรีอยุธยา'])
    expect(coverageTop.map((p) => p.rank)).toEqual([1, 2, 3])
  })
  it('matches every coverage id to a nonempty shape in the complete 77-province SVG', () => {
    expect(provinceShapes).toHaveLength(77)
    expect(provinceShapes.every((p) => provinceNames[p.id])).toBe(true)
    expect(new Set(provinceShapes.map((p) => p.id)).size).toBe(77)
    for (const province of coverageProvinces)
      expect(provinceShapes.find((p) => p.id === province.id)?.d.length).toBeGreaterThan(10)
  })
})

describe('fictional province orders', () => {
  it('reconciles the allocation with the annual demo KPI', () => {
    expect(provinceOrderRows).toHaveLength(19)
    expect(provinceOrderTotal).toBe(dashboardTotals.orders)
    expect(provinceOrderRows.every((row) => Number.isInteger(row.orders) && row.orders > 0)).toBe(true)
  })
  it('keeps Chumphon first and shows explicit zero for other map provinces', () => {
    expect(
      [...provinceOrderRows]
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 3)
        .map((p) => p.id),
    ).toEqual(['th-86', 'th-76', 'th-14'])
    expect(provinceOrderReport('th-86')).toMatchObject({ orders: 150, share: 15.9 })
    expect(provinceOrderReport('th-11')).toMatchObject({ name: 'สมุทรปราการ', orders: 0, share: 0 })
  })
})
