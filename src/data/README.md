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
| `riderProfile.js` | Rider app data for `DEFAULT_RIDER` (EA00001): `riderProfile` (partner level, vehicle, masked fictional bank accounts, rating breakdown), `createRiderActivity(now)` (a year of completed jobs + missed offers), credit/cash wallet histories and summary helpers |

Shapes are documented at the top of each file. `restaurants.test.js` checks the data against the spec
(ราชาอาหาร prices, ranges, every menu listed in a section, popular categories not empty).

- A restaurant shows its menus via `featuredMenuIds` (เมนูแนะนำ) and `menuSections` (`[{ title, menuIds }]`).
- `promo` is display text only; money rules use `offer` (see `src/state/cart.js`).
- When adding to the cart, pass `toCartRestaurant(restaurant)`, not the full object.

Images live in `src/shared/assets/images/` (downloaded from Unsplash, never hotlinked) — credits in `CREDITS.md` there.

## Rider app data

`riderProfile.js` extends `DEFAULT_RIDER`, so name, code, plate and the 4.5 rating match A3 and C10.

- Nothing derived is stored: `walletSummary(history)` sums balances and pending withdrawals, `riderToday(activity, now)` counts today's income/offers/accepted jobs, and `acceptRate(activity)` divides accepted jobs by offers.
- `createRiderActivity(now)` generates a deterministic year of jobs (60 baht each, real restaurants, `EH-BKK-…` ids from sequence 1000 up) between 10:00 and about 21:00 Bangkok time, never after `now`. `startOfBangkokDay`, `jobsBetween` and `summarizeJobs` group them by day or month.
- The cash wallet pays income for today's and yesterday's jobs; the e-mail and bank accounts are fictional and masked. `riderProfile.test.js` checks these rules.

## A5 dashboard report

`dashboard.js` exports `dashboardTotals`, `monthlyDashboard`, `topRestaurants`, `topCustomers`, `summarizeTop(rows)`, `riderSummary`, `dashboardYear`, and `getRecentOrders(orders)`.

- Report revenue/orders are fixed sample totals: 177,321 baht / 946 orders. The monthly sales/orders series sum to those totals (`dashboard.test.js`). `dashboardYear` is 2025 — a completed year, so no future month shows data.
- Monthly rows contain `{ month, name, shortName, sales, orders, restaurants, customers }`. `restaurants` is the running count of catalog restaurants on the platform (non-decreasing, ends at 6); `customers` means new registrations (295 for the year).
- Menu/rider counts and rider work states derive from the shared arrays. Blocked accounts overlap the work states, rather than increasing the rider count.
- Top restaurants reuse real catalog records; customer names are fictional. Each Top 5 is a share of the report totals, not all of it: whatever is left must fit under the fifth row for everyone outside the list (one more restaurant, 290 more customers). `summarizeTop` gives a list's sales, orders and % of report sales.
- `getRecentOrders` returns up to five valid records, newest first, without mutating the input. Recent demo checkout records are separate from the static report and do not change its KPIs.

## Historical coverage (#33)

`coverage.js` exports `coverageMetrics`, `coverageProvinces` (`{id,name,rank?}`), `coverageTop`, `coverageSource`, `provinceNames`, and `provinceShapes` (`{id,d}` parsed from the repository-owned SVG). The press-release period is May–November 2022; economic value is an estimate. Chumphon is included because it ranks first despite omission from the release's 18-name list, yielding 19 provinces. No provincial totals are invented. The SVG retains all 77 geometries under CC BY 3.0; see asset credits. Tests assert complete shape/name coverage, unique service ids and ranking membership/order.

## Rider reports (#37–#38)

`riderReports.js` groups `riderProfile.js` jobs using Bangkok calendar boundaries: `incomeDay(jobs,date,now)`, `incomeMonths(jobs,year,now)` return source `jobs` plus `{count,earning,minutes,km}`; monthly rows include `month` and `future`. Current periods are clipped at `now`, future months have no records. `bangkokDate`, `bangkokYear`, `monthStart`, `recentDays` support the calendar. Tests reconcile each KPI with its source jobs, including midnight, UTC/year boundaries and empty/future periods.

`RiderProvider` shares the existing generated activity and both ledgers across screens, recomputes derived totals, and persists only `{online,autoAccept}` through the standard storage helpers. No separate wallet/income total is persisted. The R7 ratings use `riderProfile.ratingCounts` and the common 4.5 headline; fictional contact/bank/vehicle fields remain in `riderProfile`.
