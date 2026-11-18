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
  it('keeps every province outline inside the map, so zooming centres on the province', () => {
    // Endpoints of each segment, resolving relative commands (the SVG uses M L H V C Z, upper and lower case).
    const points = (d) => {
      const result = []
      let [x, y, startX, startY] = [0, 0, 0, 0]
      for (const [, command, args] of d.matchAll(/([MLHVCZ])([^MLHVCZ]*)/gi)) {
        const n = (args.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []).map(Number)
        const relative = command === command.toLowerCase()
        const type = command.toUpperCase()
        const step = { M: 2, L: 2, H: 1, V: 1, C: 6, Z: 0 }[type]
        if (type === 'Z') [x, y] = [startX, startY]
        for (let i = 0; step && i < n.length; i += step) {
          if (type === 'H') x = (relative ? x : 0) + n[i]
          else if (type === 'V') y = (relative ? y : 0) + n[i]
          else [x, y] = [(relative ? x : 0) + n[i + step - 2], (relative ? y : 0) + n[i + step - 1]]
          if (type === 'M' && i === 0) [startX, startY] = [x, y]
          result.push([x, y])
        }
      }
      return result
    }
    const outside = provinceShapes.filter(({ d }) =>
      points(d).some(([x, y]) => x < 0 || y < 0 || x > 1051.164 || y > 1849.133),
    )
    expect(outside.map((p) => p.id)).toEqual([])
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
