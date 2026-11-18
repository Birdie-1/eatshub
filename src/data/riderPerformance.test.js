import { describe, expect, it } from 'vitest'
import { fleetShifts, PERFORMANCE_DAYS, rankRiders, riderPerformance } from './riderPerformance'
import { createRiderActivity, RIDER_EARNING } from './riderProfile'
import { incomeDay, recentDays } from './riderReports'
import { riders } from './riders'

const now = Date.parse('2026-11-18T12:30:00+07:00')
const activity = createRiderActivity(now)
const report = riderPerformance(activity, now)
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0)

describe('rider performance (A5)', () => {
  it('has one row per catalog rider and derives earnings from jobs', () => {
    expect(report.riders.map((row) => row.code)).toEqual(riders.map((rider) => rider.code))
    for (const row of report.riders) {
      expect(row.earning).toBe(row.jobs * RIDER_EARNING)
      expect(row.jobs).toBeGreaterThan(0)
      expect(row.offered).toBeGreaterThanOrEqual(row.jobs)
    }
  })

  it('sums the team summary from the rider rows, blocked riders included', () => {
    const { summary, riders: rows } = report
    expect(summary.jobs).toBe(sum(rows, 'jobs'))
    expect(summary.earning).toBe(sum(rows, 'earning'))
    expect(summary.offered).toBe(sum(rows, 'offered'))
    expect(summary.avgMinutes).toBeCloseTo(sum(rows, 'minutes') / summary.jobs, 9)
    expect(summary.acceptRate).toBeCloseTo((summary.jobs / summary.offered) * 100, 9)
    expect(summary.rating).toBeCloseTo(
      rows.reduce((total, row) => total + row.rating * row.jobs, 0) / summary.jobs,
      9,
    )
    expect(rows.filter((row) => row.riderStatus === 'block')).toHaveLength(3)
  })

  it('reconciles hourly orders with completed jobs', () => {
    expect(sum(report.hours, 'orders')).toBe(report.summary.jobs)
    expect(report.hours[0].hour).toBe(10)
    expect(report.hours.at(-1).hour).toBe(21)
    expect(report.hours.map((row) => row.hour)).toEqual(report.hours.map((_, i) => 10 + i))
  })

  it('ranks ten active riders by jobs, then rating, then code', () => {
    const { top } = report
    expect(top).toHaveLength(10)
    expect(top.every((row) => row.riderStatus === 'active')).toBe(true)
    expect(top.map((row) => row.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    for (let i = 1; i < top.length; i++) {
      const [a, b] = [top[i - 1], top[i]]
      expect(a.jobs > b.jobs || (a.jobs === b.jobs && (a.rating > b.rating || a.code < b.code))).toBe(true)
    }
    const lowest = top.at(-1)
    const ranked = new Set(top.map((row) => row.code))
    for (const row of report.riders.filter((r) => r.riderStatus === 'active' && !ranked.has(r.code)))
      expect(row.jobs <= lowest.jobs).toBe(true)
  })

  it('breaks ties deterministically', () => {
    const row = (code, jobs, rating, riderStatus = 'active') => ({ code, jobs, rating, riderStatus })
    const ranked = rankRiders([
      row('EA00099', 5, 4.5),
      row('EA00098', 5, 4.5),
      row('EA00097', 5, 4.8),
      row('EA00096', 9, 3.1, 'block'),
      row('EA00095', 6, 4.0),
    ])
    expect(ranked.map((r) => [r.rank, r.code])).toEqual([
      [1, 'EA00095'],
      [2, 'EA00097'],
      [3, 'EA00098'],
      [4, 'EA00099'],
    ])
  })

  it('matches EA00001 with R6 over the same 30 Bangkok days', () => {
    const days = recentDays(now, PERFORMANCE_DAYS)
    const r6 = days.map((date) => incomeDay(activity.jobs, date, now))
    const row = report.riders.find((r) => r.code === 'EA00001')
    expect(row.jobs).toBe(sum(r6, 'count'))
    expect(row.earning).toBe(sum(r6, 'earning'))
    expect(row.rating).toBe(4.5)
    const missed = activity.missed.filter((offer) => Date.parse(offer.at) >= report.from).length
    expect(row.offered).toBe(row.jobs + missed)
    expect(report.from).toBe(Date.parse(`${days[0]}T00:00:00+07:00`))
  })

  it('includes a demo job finished outside 10:00–22:00 without breaking the totals', () => {
    const late = { id: 'EH-DEMO', completedAt: '2026-11-17T23:40:00+07:00', minutes: 12, km: 2, earning: 60 }
    const withDemo = riderPerformance({ ...activity, jobs: [late, ...activity.jobs] }, now)
    expect(withDemo.riders[0].jobs).toBe(report.riders[0].jobs + 1)
    expect(withDemo.hours.at(-1).hour).toBe(23)
    expect(sum(withDemo.hours, 'orders')).toBe(withDemo.summary.jobs)
  })

  it('has no data after now or before the window', () => {
    for (const shift of fleetShifts(activity, now)) {
      for (const job of shift.jobs) {
        expect(job.at).toBeLessThanOrEqual(now)
        expect(job.at).toBeGreaterThanOrEqual(report.from)
      }
      for (const hour of shift.hours) expect(shift.dayStart + hour * 3600000).toBeLessThanOrEqual(now)
    }
    const beforeOpen = riderPerformance(createRiderActivity(now), Date.parse('2026-11-18T09:00:00+07:00'))
    const atNoon = riderPerformance(createRiderActivity(now), now)
    expect(beforeOpen.summary.jobs).toBeLessThan(atNoon.summary.jobs)
  })

  it('finds the busiest two hours per online rider', () => {
    const { peak, hours } = report
    expect(peak.to - peak.from).toBe(2)
    const ratio = (h) => {
      const rows = hours.filter((row) => row.hour >= h && row.hour < h + 2)
      return sum(rows, 'orders') / sum(rows, 'riderHours')
    }
    for (const row of hours.slice(0, -1)) expect(ratio(row.hour)).toBeLessThanOrEqual(ratio(peak.from))
    expect(peak.from).toBe(11)
  })

  it('gives the same numbers for the same now', () => {
    expect(riderPerformance(createRiderActivity(now), now)).toEqual(report)
  })
})
