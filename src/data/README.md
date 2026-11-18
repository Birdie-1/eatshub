# Mock data

All data is static and comes from the specs (`docs/specs/04_Mobile_Order.md`, `docs/specs/07b_BOH_Web_Admin.md`).

| File | Contents |
|---|---|
| `restaurants.js` | 6 restaurants, 19 `categories`, home `banners`; helpers `getRestaurant`, `getCategory`, `findRestaurants`, `restaurantTypes`, `toCartRestaurant` |
| `menus.js` | 45 menu items (options + add-on groups); helpers `getMenu`, `menusOf` |
| `addresses.js` | Saved delivery addresses (บ้าน / ออฟฟิศ) — the selection lives in `useAddress()` |
| `coupons.js` | Coupon codes (`EATSHUB20`, `NEWUSER100`) |
| `orders.js` | `createSampleOrders()` seeds four historical orders from real restaurant/menu data; rider identity comes from `DEFAULT_RIDER` |
| `riders.js` | 17 back-office riders (`EA00001`–`EA00017`), `createRiders()` with relative dates, and `DEFAULT_RIDER` for checkout/tracking |

Shapes are documented at the top of each file. `restaurants.test.js` checks the data against the spec
(ราชาอาหาร prices, ranges, every menu listed in a section, popular categories not empty).

- A restaurant shows its menus via `featuredMenuIds` (เมนูแนะนำ) and `menuSections` (`[{ title, menuIds }]`).
- `promo` is display text only; money rules use `offer` (see `src/state/cart.js`).
- When adding to the cart, pass `toCartRestaurant(restaurant)`, not the full object.

Images live in `src/shared/assets/images/` (downloaded from Unsplash, never hotlinked) — credits in `CREDITS.md` there.

## A5 dashboard report

`dashboard.js` exports `dashboardTotals`, `monthlyDashboard`, `topRestaurants`, `topCustomers`, `summarizeTop(rows)`, `riderSummary`, `dashboardYear`, and `getRecentOrders(orders)`.

- Report revenue/orders are fixed sample totals: 177,321 baht / 946 orders. The monthly sales/orders series sum to those totals (`dashboard.test.js`). `dashboardYear` is 2025 — a completed year, so no future month shows data.
- Monthly rows contain `{ month, name, shortName, sales, orders, restaurants, customers }`. `restaurants` is the running count of catalog restaurants on the platform (non-decreasing, ends at 6); `customers` means new registrations (295 for the year).
- Menu/rider counts and rider work states derive from the shared arrays. Blocked accounts overlap the work states, rather than increasing the rider count.
- Top restaurants reuse real catalog records; customer names are fictional. Each Top 5 is a share of the report totals, not all of it: whatever is left must fit under the fifth row for everyone outside the list (one more restaurant, 290 more customers). `summarizeTop` gives a list's sales, orders and % of report sales.
- `getRecentOrders` returns up to five valid records, newest first, without mutating the input. Recent demo checkout records are separate from the static report and do not change its KPIs.
