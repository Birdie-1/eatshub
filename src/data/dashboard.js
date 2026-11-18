import { restaurants } from './restaurants'
import { menus } from './menus'
import { riders } from './riders'

/**
 * A5 annual sample report, deliberately separate from recent demo checkout orders.
 * Monthly rows: { month, name, shortName, sales, orders, restaurants, customers }.
 * restaurants/customers mean new registrations; sales are baht and orders are counts.
 * Top-five sample rows cover all report revenue/orders, so both rankings reconcile.
 * Catalog counts always come from the shared data, never from the original PDF counts.
 */
export const dashboardYear = 2026
const months = [
  ['มกราคม', 'ม.ค.'],
  ['กุมภาพันธ์', 'ก.พ.'],
  ['มีนาคม', 'มี.ค.'],
  ['เมษายน', 'เม.ย.'],
  ['พฤษภาคม', 'พ.ค.'],
  ['มิถุนายน', 'มิ.ย.'],
  ['กรกฎาคม', 'ก.ค.'],
  ['สิงหาคม', 'ส.ค.'],
  ['กันยายน', 'ก.ย.'],
  ['ตุลาคม', 'ต.ค.'],
  ['พฤศจิกายน', 'พ.ย.'],
  ['ธันวาคม', 'ธ.ค.'],
]
const monthlySales = [8500, 10200, 11800, 13600, 14500, 15100, 16400, 17200, 15800, 19200, 17800, 17221]
const monthlyOrders = [45, 55, 63, 72, 77, 80, 88, 92, 85, 102, 95, 92]
const monthlyCustomers = [14, 18, 22, 20, 25, 26, 27, 28, 25, 30, 29, 31]
const monthlyRestaurants = restaurants.reduce((counts, _restaurant, index) => {
  counts[(index * 2) % 12] += 1
  return counts
}, Array(12).fill(0))

export const monthlyDashboard = months.map(([name, shortName], index) => ({
  month: index + 1,
  name,
  shortName,
  sales: monthlySales[index],
  orders: monthlyOrders[index],
  restaurants: monthlyRestaurants[index],
  customers: monthlyCustomers[index],
}))
export const dashboardTotals = {
  sales: 177321,
  orders: 946,
  menus: menus.length,
  riders: riders.length,
  restaurants: restaurants.length,
  customers: monthlyCustomers.reduce((total, count) => total + count, 0),
}
const restaurantSales = [52400, 41800, 33600, 28200, 21321]
const restaurantOrders = [280, 223, 179, 150, 114]
export const topRestaurants = restaurants.slice(0, 5).map((restaurant, index) => ({
  ...restaurant,
  sales: restaurantSales[index],
  orders: restaurantOrders[index],
}))
export const topCustomers = [
  { name: 'กรรณิการ์ สุขใจ', sales: 47000, orders: 250 },
  { name: 'สมใจ อิ่มสุข', sales: 39600, orders: 211 },
  { name: 'กิตติพงษ์ ใจดี', sales: 34800, orders: 186 },
  { name: 'พิมพ์ชนก สุขสันต์', sales: 30000, orders: 160 },
  { name: 'ธนากร แสงทอง', sales: 25921, orders: 139 },
]
export const riderSummary = {
  total: riders.length,
  online: riders.filter((rider) => rider.workStatus === 'online').length,
  delivery: riders.filter((rider) => rider.workStatus === 'delivery').length,
  offline: riders.filter((rider) => rider.workStatus === 'offline').length,
  blocked: riders.filter((rider) => rider.riderStatus === 'block').length,
}
export function getRecentOrders(orders) {
  return (Array.isArray(orders) ? orders : [])
    .filter(
      (order) =>
        order?.id &&
        order.restaurant?.name &&
        Number.isFinite(order.totals?.total) &&
        Number.isFinite(Date.parse(order.createdAt)),
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id))
    .slice(0, 5)
}
