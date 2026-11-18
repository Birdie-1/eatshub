import { describe, expect, it } from 'vitest'
import {
  dashboardTotals,
  monthlyDashboard,
  topRestaurants,
  topCustomers,
  riderSummary,
  getRecentOrders,
  dashboardYear,
  summarizeTop,
} from './dashboard'
import { menus } from './menus'
import { restaurants } from './restaurants'
import { riders } from './riders'

const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0)
describe('A5 report invariants', () => {
  it('uses the agreed sales and order totals with source-backed catalog counts', () => {
    expect(dashboardTotals).toMatchObject({
      sales: 177321,
      orders: 946,
      menus: menus.length,
      riders: riders.length,
      restaurants: restaurants.length,
    })
  })
  it('provides exactly twelve chronological months with nonnegative data', () => {
    expect(monthlyDashboard.map((month) => month.month)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1))
    for (const row of monthlyDashboard)
      for (const key of ['sales', 'orders', 'restaurants', 'customers']) {
        expect(Number.isSafeInteger(row[key])).toBe(true)
        expect(row[key]).toBeGreaterThanOrEqual(0)
      }
  })
  it('reports a completed year so no future month shows data', () => {
    expect(dashboardYear).toBeLessThan(new Date().getFullYear())
  })
  it('reconciles monthly revenue, orders and new customers', () => {
    expect(sum(monthlyDashboard, 'sales')).toBe(177321)
    expect(sum(monthlyDashboard, 'orders')).toBe(946)
    expect(sum(monthlyDashboard, 'customers')).toBe(dashboardTotals.customers)
  })
  it('grows the restaurant count month by month up to the catalog size', () => {
    const counts = monthlyDashboard.map((row) => row.restaurants)
    for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1])
    expect(counts[0]).toBeGreaterThan(0)
    expect(counts.at(-1)).toBe(restaurants.length)
  })
  it.each([
    ['restaurants', () => topRestaurants, () => restaurants.length],
    ['customers', () => topCustomers, () => dashboardTotals.customers],
  ])('keeps the top-five %s a believable part of the totals', (_name, getRows, getPopulation) => {
    const rows = getRows()
    const rest = getPopulation() - rows.length
    expect(rows).toHaveLength(5)
    for (const key of ['sales', 'orders']) {
      const remainder = dashboardTotals[key] - sum(rows, key)
      expect(remainder).toBeGreaterThan(0)
      // Everyone outside the top five ranks below the fifth row.
      expect(remainder).toBeLessThanOrEqual(rest * rows.at(-1)[key])
      expect(rows.map((row) => row[key])).toEqual([...rows].map((row) => row[key]).sort((a, b) => b - a))
    }
  })
  it('summarizes a top-five list with its share of report sales', () => {
    const rows = [
      { sales: 100, orders: 2 },
      { sales: 50, orders: 1 },
    ]
    expect(summarizeTop(rows, { sales: 600 })).toEqual({ sales: 150, orders: 3, share: 25 })
  })
  it('uses real restaurant names, images and addresses', () => {
    expect(new Set(topRestaurants.map((row) => row.id)).size).toBe(5)
    for (const row of topRestaurants)
      expect(row).toMatchObject(restaurants.find((restaurant) => restaurant.id === row.id))
  })
  it('matches rider work states and treats blocked accounts as overlapping, not extra riders', () => {
    expect(riderSummary.total).toBe(riders.length)
    expect(riderSummary.online + riderSummary.delivery + riderSummary.offline).toBe(riders.length)
    expect(riderSummary.blocked).toBe(riders.filter((rider) => rider.riderStatus === 'block').length)
    expect(riderSummary).toMatchObject({ online: 6, delivery: 4, offline: 7, blocked: 3 })
  })
})
describe('recent demo orders', () => {
  it('selects the five newest without mutating history and includes cancelled orders', () => {
    const orders = Array.from({ length: 7 }, (_, i) => ({
      id: `order-${i}`,
      createdAt: `2026-11-${String(i + 1).padStart(2, '0')}T12:00:00+07:00`,
      restaurant: { name: 'ร้านตัวอย่าง' },
      totals: { total: 100 + i },
      cancelled: i === 6,
    }))
    const original = structuredClone(orders)
    expect(getRecentOrders(orders).map((order) => order.id)).toEqual([
      'order-6',
      'order-5',
      'order-4',
      'order-3',
      'order-2',
    ])
    expect(orders).toEqual(original)
  })
  it('handles empty or unusable records without crashing the dashboard', () => {
    expect(getRecentOrders([])).toEqual([])
    expect(getRecentOrders(null)).toEqual([])
    expect(getRecentOrders([{ id: 'bad', createdAt: 'invalid' }])).toEqual([])
  })
})
