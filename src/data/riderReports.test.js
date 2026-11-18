import { describe, expect, it } from 'vitest'
import { createRiderActivity, summarizeJobs } from './riderProfile'
import { bangkokDate, bangkokYear, incomeDay, incomeMonths, recentDays } from './riderReports'

const now = new Date('2026-11-18T16:00:00+07:00')
const { jobs } = createRiderActivity(now)
describe('rider income periods', () => {
  it('uses Bangkok dates, including the UTC date boundary', () => {
    expect(bangkokDate('2026-11-17T18:00:00Z')).toBe('2026-11-18')
    expect(bangkokYear('2025-12-31T18:00:00Z')).toBe(2026)
  })
  it('sums each daily KPI from exactly the jobs displayed', () => {
    for (const date of recentDays(now)) {
      const report = incomeDay(jobs, date, now)
      expect(report).toMatchObject(summarizeJobs(report.jobs))
      expect(report.jobs.every((j) => bangkokDate(j.completedAt) === date)).toBe(true)
      expect(report.earning).toBe(report.count * 60)
    }
  })
  it('reconciles all 12 monthly KPIs with their jobs and has no future data', () => {
    const months = incomeMonths(jobs, 2026, now)
    expect(months).toHaveLength(12)
    for (const report of months) expect(report).toMatchObject(summarizeJobs(report.jobs))
    expect(months[11]).toMatchObject({ future: true, count: 0, earning: 0, jobs: [] })
    expect(months.slice(0, 11).every((m) => !m.future)).toBe(true)
    expect(months.flatMap((m) => m.jobs)).toHaveLength(
      jobs.filter((j) => bangkokYear(j.completedAt) === 2026).length,
    )
  })
  it('ignores future records and handles midnight and empty periods', () => {
    const rows = [
      { completedAt: '2026-11-18T00:00:00+07:00', earning: 60, minutes: 20, km: 2.4 },
      { completedAt: '2026-11-19T00:00:00+07:00', earning: 60, minutes: 20, km: 2.4 },
    ]
    expect(incomeDay(rows, '2026-11-18', now)).toMatchObject({ count: 1, earning: 60 })
    expect(incomeDay(rows, '2026-11-19', now).count).toBe(0)
    expect(incomeMonths([], 2026, now).every((m) => m.count === 0)).toBe(true)
  })
})
