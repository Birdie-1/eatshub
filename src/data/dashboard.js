import { restaurants } from './restaurants'
import { menus } from './menus'
import { riders } from './riders'

/**
 * A5 annual sample report, deliberately separate from recent demo checkout orders.
 * Monthly rows: { month, name, shortName, sales, orders, restaurants, customers }.
 * restaurants is the running count of restaurants on the platform (ends at the catalog size);
 * customers means new registrations; sales are baht and orders are counts.
 * The report covers a completed year, so no month is in the future.
 * Top-five rows are a share of the report totals; everyone else ranks below the fifth row.
 * Catalog counts always come from the shared data, never from the original PDF counts.
 */
export const dashboardYear = 2025
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
// Month each catalog restaurant joined, in catalog order (one entry per restaurant).
const restaurantJoinMonths = [1, 1, 3, 5, 8, 10]
const monthlyRestaurants = months.map(
  (_month, index) => restaurantJoinMonths.filter((joined) => joined <= index + 1).length,
)

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
const restaurantSales = [44800, 36500, 30200, 25600, 21900]
const restaurantOrders = [240, 195, 161, 136, 116]
export const topRestaurants = restaurants.slice(0, 5).map((restaurant, index) => ({
  ...restaurant,
  sales: restaurantSales[index],
  orders: restaurantOrders[index],
}))
export const topCustomers = [
  { name: 'กรรณิการ์ สุขใจ', sales: 9850, orders: 52 },
  { name: 'สมใจ อิ่มสุข', sales: 8420, orders: 45 },
  { name: 'กิตติพงษ์ ใจดี', sales: 7380, orders: 39 },
  { name: 'พิมพ์ชนก สุขสันต์', sales: 6650, orders: 35 },
  { name: 'ธนากร แสงทอง', sales: 5910, orders: 31 },
]
export function summarizeTop(rows, totals = dashboardTotals) {
  const sales = rows.reduce((total, row) => total + row.sales, 0)
  const orders = rows.reduce((total, row) => total + row.orders, 0)
  return { sales, orders, share: Math.round((sales / totals.sales) * 100) }
}
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
