# Mock data

All data is static and comes from the specs (`docs/specs/04_Mobile_Order.md`, `docs/specs/07b_BOH_Web_Admin.md`).

| File | Contents |
|---|---|
| `restaurants.js` | 6 restaurants, 19 `categories`, home `banners`; helpers `getRestaurant`, `getCategory`, `findRestaurants`, `restaurantTypes`, `toCartRestaurant` |
| `menus.js` | 45 menu items (options + add-on groups); helpers `getMenu`, `menusOf` |
| `addresses.js` | Saved delivery addresses (บ้าน / ออฟฟิศ) — the selection lives in `useAddress()` |
| `coupons.js` | Coupon codes (`EATSHUB20`, `NEWUSER100`) |
| `orders.js` | `createSampleOrders()` seeds four historical orders from real restaurant/menu data; rider identity comes from `DEFAULT_RIDER`. `createDemoJob({ seq, now })` builds the R3 simulated job (restaurant rotates by `seq`, one dish × enough qty to meet the minimum order, `simulated: true`, offered for 45 s) |
| `riders.js` | 17 back-office riders (`EA00001`–`EA00017`), `createRiders()` with relative dates, and `DEFAULT_RIDER` for checkout/tracking |
| `riderPerformance.js` | A5 rider performance over the last 30 Bangkok days for all 17 riders: `riderPerformance(activity, now)`, `rankRiders(rows)`, `fleetShifts(activity, now)`, `PERFORMANCE_DAYS` |
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

`dashboard.js` exports `dashboardTotals`, `monthlyDashboard`, `topRestaurants`, `topCustomers`, `summarizeTop(rows)`, `averageOrderValue`, `halfYearGrowth(key)`, `riderSummary`, `dashboardYear`, and `getRecentOrders(orders)`.

- `averageOrderValue` is report sales ÷ report orders rounded to whole baht (187). `halfYearGrowth(key)` is the % change of July–December over January–June for a monthly series (`null` if the first half is zero); the dashboard KPIs show it for sales, orders and new customers. `topCustomers` and the restaurant/customer monthly series are no longer shown on A5 but stay as tested sample data.

- Report revenue/orders are fixed sample totals: 177,321 baht / 946 orders. The monthly sales/orders series sum to those totals (`dashboard.test.js`). `dashboardYear` is 2025 — a completed year, so no future month shows data.
- Monthly rows contain `{ month, name, shortName, sales, orders, restaurants, customers }`. `restaurants` is the running count of catalog restaurants on the platform (non-decreasing, ends at 6); `customers` means new registrations (295 for the year).
- Menu/rider counts and rider work states derive from the shared arrays. Blocked accounts overlap the work states, rather than increasing the rider count.
- Top restaurants reuse real catalog records; customer names are fictional. Each Top 5 is a share of the report totals, not all of it: whatever is left must fit under the fifth row for everyone outside the list (one more restaurant, 290 more customers). `summarizeTop` gives a list's sales, orders and % of report sales.
- `getRecentOrders` returns up to five valid records, newest first, without mutating the input. Recent demo checkout records are separate from the static report and do not change its KPIs.

## Historical coverage (#33)

`coverage.js` exports `coverageProvinces` (`{id,name,rank?}`), `coverageTop`, `provinceNames`, and `provinceShapes` (`{id,d}` parsed from the repository-owned SVG). The provinces and ranking come from the May–November 2022 press release; its headline figures are no longer shown (#43). Chumphon is included because it ranks first despite omission from the release's 18-name list, yielding 19 provinces. No provincial totals are invented. The SVG retains all 77 geometries under CC BY 3.0; see asset credits. Tests assert complete shape/name coverage, unique service ids and ranking membership/order.

## Rider reports (#37–#38)

`riderReports.js` groups `riderProfile.js` jobs using Bangkok calendar boundaries: `incomeDay(jobs,date,now)`, `incomeMonths(jobs,year,now)` return source `jobs` plus `{count,earning,minutes,km}`; monthly rows include `month` and `future`. Current periods are clipped at `now`, future months have no records. `bangkokDate`, `bangkokYear`, `monthStart`, `recentDays` support the calendar. Tests reconcile each KPI with its source jobs, including midnight, UTC/year boundaries and empty/future periods.

`RiderProvider` shares the existing generated activity and both ledgers across screens, recomputes derived totals, while `useRiderStatus()` in `preferences.js` persists the shared `{online,autoAccept}` switches through the standard storage helpers. No separate wallet/income total is persisted. The R7 ratings use `riderProfile.ratingCounts` and the common 4.5 headline; fictional contact/bank/vehicle fields remain in `riderProfile`.

`completedRiderJobs(orders, now)` derives earned jobs only from non-cancelled EA00001 orders with `riderJob.step === 5` and valid, non-future completion timestamps. IDs are deduplicated; the provider combines these with the sample history and uses the same jobs for R2/R5/R6. Each earns `RIDER_EARNING` (60 baht); minutes use actual stage timestamps rounded to tenths, distance uses the same catalog `distanceKm` as the offer. Distance totals retain two decimal places so per-job figures reconcile. Income is never persisted separately.

## Province-order demo

`coverage.js` additionally exports `provinceOrderRows`, `provinceOrderTotal` and `provinceOrderReport(id)`. The user authorized fictional province order counts for the interactive map: 19 rows sum to 946 (the 2025 demo KPI), with Chumphon/Phetchaburi/Ayutthaya leading. Other map provinces return zero. These figures are not inferred from the 2022 release or live checkout orders. Tests reconcile the allocation with the KPI and check that other provinces are zero.

## Rider performance (#43)

`riderPerformance(activity, now)` returns `{ from, until, riders, summary, top, hours, peak }` for the 30 Bangkok days of the R6 day strip (midnight 29 days ago up to `now`). Shapes are in the file header.

- EA00001 reads the activity passed in (the dashboard passes `useRider().activity`, so demo jobs finished in R3–R4 count) plus its missed offers and the shared 4.5 rating. The other 16 riders get fixed shifts, paces, ratings and miss rates from the `fleet` table and jobs generated per online hour from a lunch/dinner demand curve; one day off a week. Same `now` → same numbers; nothing is after `now`.
- Nothing derived is stored: earnings are `jobs × RIDER_EARNING`, the summary sums the 17 rows (blocked riders included), minutes and rating are weighted by jobs, and acceptance is jobs ÷ offers.
- `hours` covers 10:00–22:00, widened if a job falls outside, so hourly orders always add up to the completed jobs. `peak` is the two consecutive hours with the most orders per online rider-hour (earliest wins a tie).
- `rankRiders` keeps active riders only and sorts by jobs, then rating, then code. `riderPerformance.test.js` checks these invariants, the EA00001 match with R6 and the absence of future data.
