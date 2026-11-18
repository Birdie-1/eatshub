import { describe, expect, it } from 'vitest'
import { coverageProvinces, coverageTop, provinceShapes, coverageMetrics, provinceNames } from './coverage'

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
  it('retains all four historical metrics and labels the economic estimate', () => {
    expect(coverageMetrics.map((m) => m.value)).toEqual(['600,000+', '10,000,000+', '25,000+', '~500'])
    expect(coverageMetrics[3].unit).toContain('คาดการณ์')
  })
})
