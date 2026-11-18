import { describe, expect, it } from 'vitest'
import { riderEarningsInsights } from './adminInsights'

const now = Date.parse('2026-11-18T15:00:00+07:00')
const job = (id, date, earning = 60) => ({ id, completedAt: date, earning })
describe('admin rider income', () => {
  it('calculates daily and monthly maxima from aggregate earnings, including Bangkok boundaries', () => {
    const report = riderEarningsInsights(
      [
        job('a', '2026-11-17T18:00:00Z'),
        job('b', '2026-11-18T10:00:00+07:00'),
        job('c', '2026-10-05T10:00:00+07:00', 90),
        job('d', '2026-10-06T10:00:00+07:00', 90),
      ],
      now,
    )
    expect(report.today).toEqual({ period: '2026-11-18', earning: 120, count: 2 })
    expect(report.peakDay).toEqual(report.today)
    expect(report.peakMonth).toEqual({ period: '2026-10', earning: 180, count: 2 })
    expect(report.daily.reduce((s, r) => s + r.earning, 0)).toBe(
      report.monthly.reduce((s, r) => s + r.earning, 0),
    )
  })
  it('excludes duplicate, future, invalid and out-of-window jobs', () => {
    const valid = job('a', '2026-11-18T10:00:00+07:00')
    expect(
      riderEarningsInsights(
        [
          valid,
          valid,
          job('b', '2026-11-19T10:00:00+07:00'),
          job('c', '2025-11-18T10:00:00+07:00'),
          job('d', 'invalid'),
          job('e', '2026-11-18T10:00:00+07:00', -1),
        ],
        now,
      ).today.earning,
    ).toBe(60)
  })
  it('selects the latest tied peak and supports empty data', () => {
    expect(
      riderEarningsInsights(
        [job('a', '2026-11-16T10:00:00+07:00'), job('b', '2026-11-17T10:00:00+07:00')],
        now,
      ).peakDay.period,
    ).toBe('2026-11-17')
    expect(riderEarningsInsights([], now)).toMatchObject({
      peakDay: null,
      peakMonth: null,
      today: { earning: 0, count: 0 },
    })
  })
})
