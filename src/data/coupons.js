/** Coupon codes accepted by the cart (one per order). Amounts in baht. */
export const coupons = [
  { code: 'EATSHUB20', label: 'ลด 20 ฿ เมื่อสั่งครบ 100 ฿', amount: 20, minFood: 100 },
  { code: 'NEWUSER100', label: 'ลด 100 ฿ เมื่อสั่งครบ 300 ฿', amount: 100, minFood: 300 },
]

export function findCoupon(code) {
  const normalized = String(code ?? '')
    .trim()
    .toUpperCase()
  return coupons.find((c) => c.code === normalized) ?? null
}
