import { describe, expect, it } from 'vitest'
import { createRiderActivity, summarizeJobs } from './riderProfile'
import {
  bangkokDate,
  bangkokYear,
  incomeDay,
  incomeMonths,
  recentDays,
  completedRiderJobs,
} from './riderReports'

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

describe('rider-completed demo earnings', () => {
  const order = {
    id: 'demo-order',
    rider: { code: 'EA00001' },
    restaurant: { id: 'racha-ahan', name: 'ราชาอาหาร' },
    riderJob: {
      step: 5,
      times: [
        '2026-11-18T10:00:00+07:00',
        '2026-11-18T10:02:00+07:00',
        '2026-11-18T10:03:00+07:00',
        '2026-11-18T10:05:00+07:00',
      ],
    },
  }
  it('derives a single 60-baht job from the completed order snapshot', () => {
    const jobs = completedRiderJobs([order, order], now)
    expect(jobs).toHaveLength(1)
    expect(jobs[0]).toMatchObject({ id: order.id, earning: 60, minutes: 5, restaurantName: 'ราชาอาหาร' })
    expect(incomeDay(jobs, '2026-11-18', now).earning).toBe(60)
    expect(
      summarizeJobs([
        { ...jobs[0], km: 13 },
        { ...jobs[0], km: 3.83 },
      ]).km,
    ).toBe(16.83)
  })
  it('excludes timed, incomplete, cancelled, other-rider and future jobs', () => {
    expect(
      completedRiderJobs(
        [
          { ...order, riderJob: undefined },
          { ...order, riderJob: { ...order.riderJob, step: 4 } },
          { ...order, cancelled: true },
          { ...order, rider: { code: 'EA00002' } },
          {
            ...order,
            riderJob: {
              ...order.riderJob,
              times: [...order.riderJob.times.slice(0, 3), '2026-11-19T10:00:00+07:00'],
            },
          },
        ],
        now,
      ),
    ).toEqual([])
  })
})
