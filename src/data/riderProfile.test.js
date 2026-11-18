import { describe, expect, it } from 'vitest'
import {
  acceptRate,
  averageRating,
  createCashHistory,
  createCreditHistory,
  createRiderActivity,
  RIDER_EARNING,
  riderProfile,
  riderToday,
  startOfBangkokDay,
  summarizeJobs,
  walletSummary,
} from './riderProfile'
import { DEFAULT_RIDER, riders } from './riders'
import { restaurants } from './restaurants'

// 14:00 in Bangkok, so today already has completed jobs.
const now = new Date('2026-11-18T07:00:00Z')
const activity = createRiderActivity(now)

describe('rider profile', () => {
  it('is the same person as the back-office record and the rider on customer orders', () => {
    for (const key of ['code', 'name', 'phone', 'plate', 'province', 'rating'])
      expect(riderProfile[key]).toBe(DEFAULT_RIDER[key])
    expect(riderProfile.code).toBe(riders[0].code)
    expect(riderProfile.vehicle.plate).toBe(riders[0].plate)
  })
  it('has a rating breakdown that averages to the shared rating', () => {
    expect(Math.round(averageRating(riderProfile.ratingCounts) * 10) / 10).toBe(DEFAULT_RIDER.rating)
  })
  it('shows only masked, fictional bank account numbers', () => {
    expect(riderProfile.bankAccounts).toHaveLength(3)
    for (const account of riderProfile.bankAccounts) expect(account.number).toMatch(/^xxx-x-x\d{4}-x$/)
  })
})

describe('rider activity', () => {
  it('is deterministic for the same moment', () => {
    expect(createRiderActivity(now)).toEqual(activity)
  })
  it('never contains future jobs or offers, newest first', () => {
    const times = activity.jobs.map((job) => Date.parse(job.completedAt))
    for (const time of times) expect(time).toBeLessThanOrEqual(now.getTime())
    expect([...times].sort((a, b) => b - a)).toEqual(times)
    for (const offer of activity.missed) expect(Date.parse(offer.at)).toBeLessThanOrEqual(now.getTime())
  })
  it('covers a year of jobs at the spec earning, from real restaurants, with unique order numbers', () => {
    const oldest = Date.parse(activity.jobs.at(-1).completedAt)
    expect(now.getTime() - oldest).toBeGreaterThan(364 * 86400000)
    const ids = activity.jobs.map((job) => job.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const job of activity.jobs) {
      expect(job.id).toMatch(/^EH-BKK-\d{6}-\d{5}$/)
      expect(job.earning).toBe(RIDER_EARNING)
      expect(restaurants.find((restaurant) => restaurant.id === job.restaurantId)?.name).toBe(
        job.restaurantName,
      )
    }
  })
  it('sums today from the records', () => {
    const today = riderToday(activity, now)
    const from = startOfBangkokDay(now)
    const todayJobs = activity.jobs.filter((job) => Date.parse(job.completedAt) >= from)
    expect(today.accepted).toBe(todayJobs.length)
    expect(today.accepted).toBeGreaterThan(0)
    expect(today.earning).toBe(summarizeJobs(todayJobs).earning)
    expect(today.offered).toBeGreaterThanOrEqual(today.accepted)
  })
  it('has no jobs before 10:00 Bangkok time', () => {
    const early = createRiderActivity(new Date('2026-11-18T02:00:00Z')) // 09:00 Bangkok
    expect(riderToday(early, new Date('2026-11-18T02:00:00Z')).accepted).toBe(0)
  })
  it('derives a high but imperfect acceptance rate', () => {
    const rate = acceptRate(activity)
    expect(rate).toBeCloseTo((activity.jobs.length / (activity.jobs.length + activity.missed.length)) * 100)
    expect(rate).toBeGreaterThan(98)
    expect(rate).toBeLessThan(100)
  })
  it('summarizes jobs', () => {
    const sample = activity.jobs.slice(0, 3)
    expect(summarizeJobs(sample)).toEqual({
      count: 3,
      earning: 3 * RIDER_EARNING,
      minutes: sample.reduce((total, job) => total + job.minutes, 0),
      km: Math.round(sample.reduce((total, job) => total + job.km, 0) * 10) / 10,
    })
  })
})

describe('rider wallets', () => {
  const credit = createCreditHistory(now)
  const cash = createCashHistory(activity.jobs, now)
  it('computes balances from the history and never goes negative', () => {
    for (const history of [credit, cash]) {
      const { balance } = walletSummary(history)
      expect(balance).toBe(history.reduce((total, item) => total + item.amount, 0))
      expect(balance).toBeGreaterThanOrEqual(0)
    }
  })
  it('counts only pending withdrawals as awaiting approval', () => {
    expect(walletSummary(cash).pending).toBe(1500)
    expect(walletSummary(credit).pending).toBe(0)
  })
  it('pays cash income only for real jobs, at the job earning', () => {
    const jobs = new Map(activity.jobs.map((job) => [job.id, job]))
    const income = cash.filter((item) => item.type === 'income')
    expect(income.length).toBeGreaterThan(0)
    for (const item of income) expect(item.amount).toBe(jobs.get(item.orderId).earning)
  })
  it('keeps every entry in the past, newest first, with unique ids', () => {
    for (const history of [credit, cash]) {
      const times = history.map((item) => Date.parse(item.at))
      for (const time of times) expect(time).toBeLessThanOrEqual(now.getTime())
      expect([...times].sort((a, b) => b - a)).toEqual(times)
      expect(new Set(history.map((item) => item.id)).size).toBe(history.length)
    }
  })
})
