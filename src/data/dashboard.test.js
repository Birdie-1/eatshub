import { describe, expect, it } from 'vitest'
import {
  dashboardTotals,
  monthlyDashboard,
  topRestaurants,
  topCustomers,
  riderSummary,
  getRecentOrders,
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
  it('reconciles monthly revenue, orders, restaurant registrations and new customers', () => {
    expect(sum(monthlyDashboard, 'sales')).toBe(177321)
    expect(sum(monthlyDashboard, 'orders')).toBe(946)
    expect(sum(monthlyDashboard, 'restaurants')).toBe(restaurants.length)
    expect(sum(monthlyDashboard, 'customers')).toBe(dashboardTotals.customers)
  })
  it.each([
    ['restaurants', () => topRestaurants],
    ['customers', () => topCustomers],
  ])('reconciles the top-five %s with the headline totals', (_name, getRows) => {
    const rows = getRows()
    expect(rows).toHaveLength(5)
    expect(sum(rows, 'sales')).toBe(177321)
    expect(sum(rows, 'orders')).toBe(946)
    expect(rows.map((row) => row.sales)).toEqual(
      [...rows].sort((a, b) => b.sales - a.sales).map((row) => row.sales),
    )
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
