# eatsHub Mockup

Mobile-first clickable mockup of the eatsHub food-delivery platform, deployed to Vercel.

## Run locally

Requires Node 20.19+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run lint     # ESLint
npm test         # Vitest (money rules in src/state/cart.js)
npm run format   # Prettier — run before committing
```

Deploys to Vercel as a static Vite site (`vercel.json` rewrites all paths to `index.html` so deep links work).

## Project structure

```
brand/                  logo files (primary color #FCBB18), imported via @brand/...
docs/REQUIREMENTS.md    mockup scope, decisions, done criteria (source of truth)
docs/specs/             module specs summarized from the original PDFs
src/
  main.jsx, router.jsx  entry + all routes; screen IDs (C1–C12, R1–R7, A1–A5) match REQUIREMENTS.md
  index.css             Tailwind + design tokens (see "Styling" below)
  customer/             customer app
    layouts/            TabLayout (bottom nav ร้านอาหาร · ตะกร้า · ออเดอร์ · บัญชี)
    pages/              C1–C12 screens
    components/         customer-only UI: RestaurantCard, CategoryGrid, BannerCarousel,
                        RestaurantFilterSheet, AddressSheet, MenuCard (C4 items), StarRating,
                        FloatingCartBar (C6)
  rider/                rider app (R1–R7, scope in REQUIREMENTS §4.1; issues #34–#38)
    layouts/            RiderTabLayout (dark bottom nav หน้าแรก · กระเป๋าเงิน · รายได้ · บัญชี)
    pages/              R1 sign-in, R2 home (+ R3 popup), R4 job + earnings summary; R5–R7 are placeholders until #37–#38
    components/         RequireRider (demo route guard), Switch, StatsSheet (R2 pull-up sheet),
                        JobOfferDialog (R3), SignaturePad (R4)
    useRiderSummary.js  wallet balances + today's numbers shared by R2 and R5
  admin/                back office
    layouts/            AdminLayout (header, sidebar with ☰ on mobile, footer), adminMenu.js
    pages/              A1 sign-in, A3 rider list
  shared/               used by more than one app
    pages/Landing.jsx   choose customer app / rider app / back office
    components/         shared UI (see "Shared building blocks" below)
    lib/format.js       formatBaht / formatAmount
    assets/images/      Unsplash food photos + rider-map.svg (stored in repo, never hotlinked)
  data/                 static mock data from the specs (see src/data/README.md), coupons.js
  state/                cart, orders, session (React Context + localStorage) and fixtures
```

Customer and back-office demo flows are implemented. See [the five-minute demo script](docs/DEMO.md) and [integration QA results](docs/QA.md).

Production: **https://eatshub-red.vercel.app**. The Vercel project is linked to this repo, so every merge to `main` deploys production automatically and each PR gets a preview URL.

## Customer ordering demo

- Landing has separate customer, rider and back-office entrances (three columns from `md` up). Customer routes require the demo session and return to the requested page after sign-in.
- Checkout reads the real cart, addresses and `calcTotals` output. COD, PromptPay sample QR and PayPal confirmation are simulations; no financial credentials are collected.
- Every order freezes its items, notes, address, totals and `DEFAULT_RIDER`. Order IDs use a persisted sequence beginning after sample order 00012.
- Tracking advances every 8 seconds (about 32 seconds total); the demo skip button survives refresh. COD becomes paid only on delivery.
- If the rider app is signed in and online when the order is placed, the order is offered to the rider instead: it waits at stage 1 for up to 45 seconds (R3 popup, or taken at once with auto-accept). Once accepted, only the rider's buttons on R4 move it (no skip button on C10); if nobody accepts, the clock takes over from stage 2. With the rider app signed out or offline, tracking runs on the clock as before.
- Orders are shared through `localStorage` and every tab listens for changes, so the customer app and rider app can run side by side in two windows (or by switching apps in one tab) and follow each other.
- Once delivered, the customer rates the order once via `rate(id, { rider, restaurant, review })`, Grab/LINE MAN style: rider stars (1–5) are required, restaurant stars and a review (≤ 200 chars) are optional. A back-to-home button is shown before and after rating. The history tab's "เขียนรีวิว" opens the same sheet.
- History seeds four sample orders once, preserves new orders across refresh and logout, and supports an explicitly empty saved history.
- Logout clears the customer's cart and session while retaining order history. The floating cart bar uses the same final total as Checkout.

## Back-office prototype

Open `/admin/signin` and submit the prefilled `admin` demo form. Visiting `/admin/riders` while signed out redirects to sign-in and then returns to the requested page.
The back office uses the full browser width: mobile rider cards below 1024px and a sortable table on larger screens (the table scrolls horizontally when needed).

- 17 sample riders, search by name/code/phone/vehicle/province, work and account filters, page size and pagination.
- Mobile navigation opens as a modal drawer with Escape, backdrop dismissal and keyboard focus handling.
- The sidebar lists only the screens that exist (dashboard, rider management, logout); unbuilt admin pages are hidden rather than shown as dead links.
- Active/Block can be changed in page state. Blocking requires a reason and updates the editor and timestamp; reloading resets the sample data.
- Sign-in is a demonstration using `useSession`, not real authentication. Logout clears the admin session and returns to Landing.
- No API or database is connected. Rider records live in `src/data/riders.js`.
- `DEFAULT_RIDER` exports EA00001 for checkout/tracking; rider dates are generated relative to the current time.

Run commands inside the inner `eatshub` directory containing `package.json`. If your terminal is in the outer directory, run `cd .\eatshub` first.

| Route | Screen |
|---|---|
| `/` | Landing |
| `/app/signin` | C1 Sign In |
| `/app` | C2 Home |
| `/app/search` | C3 Search / categories |
| `/app/restaurant/:restaurantId` | C4 Restaurant (+ C6 floating cart bar) |
| `/app/restaurant/:restaurantId/menu/:menuId` | C5 Menu item |
| `/app/cart` | C7 Cart |
| `/app/checkout` | C8 Checkout |
| `/app/payment/:method` | C9 Payment (`promptpay` / `paypal`) |
| `/app/success/:orderId` | Order/payment success (refresh-safe) |
| `/app/orders/:orderId` | C10 Order tracking |
| `/app/orders` | C11 Order history |
| `/app/account` | C12 Account |
| `/app/account/favorites` | C12 sub-page: favorite restaurants |
| `/rider/signin` | R1 Rider sign in |
| `/rider` | R2 Rider home (+ R3 new-job popup) |
| `/rider/jobs/:orderId` | R4 Delivery in progress + earnings summary |
| `/rider/wallet` | R5 Wallets |
| `/rider/income` | R6 Income |
| `/rider/account` | R7 Account |
| `/admin/signin` | A1 Back-office sign in |
| `/admin` | A5 Dashboard (default after admin sign-in) |
| `/admin/riders` | A3 Rider list |

## Styling

Use the tokens in `src/index.css`, never raw hex:

| Token | Use for |
|---|---|
| `brand` / `brand-dark` / `brand-light` | primary buttons, selected tab, floating cart bar, back-office footer |
| `ink` / `muted` | main / secondary text |
| `surface` | back-office content background, section dividers in the app |
| `admin` / `admin-dark` | back-office sidebar and sign-in background |
| `success` · `danger` · `warning` · `info` (+ `-light`) | badges and status colors |
| `status-online` · `status-offline` · `status-delivery` | rider status (aliases of the above) |

Shapes: cards `rounded-2xl`, buttons `rounded-xl`. Fonts: Montserrat for Latin/digits, IBM Plex Sans Thai for Thai (already set as `font-sans`).

Inside the phone frame, use `sticky`/`absolute` instead of `fixed` so bars stay inside the phone on desktop.

## Shared building blocks

**Components** (`src/shared/components/`):

| Component | Notes |
|---|---|
| `Button` | `variant="primary" \| "secondary" \| "ghost"`, `size="sm" \| "md" \| "lg"`, `block`, `to="/path"` renders a Link |
| `Card` | white `rounded-2xl` box; `padded={false}` for images/lists |
| `Badge` | `tone="success" \| "danger" \| "warning" \| "info" \| "brand" \| "neutral"`, `solid` for filled |
| `TopBar` | sticky back button + title; `backTo`, `right`, `transparent` (over a cover image) |
| `BottomSheet` | `open`, `onClose`, `title`, `footer`; stays inside the phone frame |
| `ConfirmDialog` | centered yes/no dialog: `open`, `title`, `confirmLabel`, `onConfirm`, `onCancel`; stays inside the phone frame |
| `toast(msg)` | from `Toast.jsx`; shows a short message in the nearest `<Toaster />` |

**Money**: `formatBaht(215)` → `215 ฿` for prices in lists; `formatAmount(215)` → `215.00` for order summaries.

**State** — `import { useCart, useOrders, useSession, useRiderStatus } from '@/state'`:

```js
useCart()    // { restaurant, items, noteToStore, noteToRider, coupon, totals,
             //   add(item, restaurant, { replace }), updateQty(key, qty), remove(key), clear(),
             //   setNotes({ noteToStore, noteToRider }), applyCoupon(code), removeCoupon() }
useOrders()  // { orders, createOrder({ cart, address, payment }), getOrder(id), getStatus(order), advance(id), rate(id, { rider, restaurant, review }),
             //   acceptJob(id, { auto }), advanceJob(id, fromStage) } — rider side (R3–R4)
useSession() // { customerSignedIn, adminSignedIn, riderSignedIn, signIn('customer' | 'admin' | 'rider'), signOut(kind) }
useAddress() // { address: { id, label, detail }, addresses, setAddress(id) } — picked on C2, default for C8
useFavorites() // { favorites, isFavorite(id), toggleFavorite(id) } — restaurant ♥
useRiderStatus() // { online, autoAccept, setOnline(bool), setAutoAccept(bool) } — rider switches (R2, R7); default both on
```

- Build cart lines with `makeCartItem({ restaurantId, menu, option, addons, note, qty })` (same choices + note → same `key`, so quantities merge).
- Show a line's choices with `formatChoices(item)` → `สุกี้น้ำ, กุ้ง(15), ลูกชิ้นปลา(10)` (from `@/state`).
- `add()` returns `{ ok: false, reason: 'different-restaurant' }` when the cart has another store's food — show the "clear cart?" dialog, then call `add(item, restaurant, { replace: true })`.
- **All money comes from `totals`** (`calcTotals` in `src/state/cart.js`): `food`, `delivery`, `storeDiscount`, `couponDiscount`, `total`, `points`, `itemCount`, `minOrder`, `meetsMinOrder`, `couponApplies`. Never recompute amounts in a screen.
- Restaurant/menu data: `getRestaurant(id)`, `findRestaurants({ q, categoryId, type })`, `toCartRestaurant(r)` from `@/data/restaurants`; `getMenu(id)`, `menusOf(restaurantId)` from `@/data/menus` (see `src/data/README.md`).
- Coupons live in `src/data/coupons.js` (`EATSHUB20`, `NEWUSER100`).
- `src/state/fixtures.js` has the spec's sample cart (ราชาอาหาร, 215 ฿ / 9 points) for tests; shipped screens read the live cart instead.
- Rider jobs (`src/state/orders.js`): `canAcceptJob(order)`, `acceptJob`, `advanceJob` and `stepTimes(order)` (when each stage was reached, for C10). An offered order carries `jobOfferExpiresAt`; an accepted one carries `riderJob: { step, times, auto? }`. Nothing else in the order snapshot changes. `isRiderOnDuty()` (`src/state/preferences.js`) decides whether a new order is offered.
- Everything is saved to `localStorage` (keys prefixed `eatshub:`); clear it to reset the demo. `subscribe(key, callback)` in `src/state/storage.js` delivers changes made by other tabs.

## Working together (2 people)

`main` is the deployable branch — don't push to it directly. Work on a branch and open a Pull Request.

```bash
# 1. Start from the latest main
git checkout main
git pull

# 2. Create a branch for your issue: feature/<issue number>-<short name>
git checkout -b feature/3-home

# 3. Commit and push your work
git add .
git commit -m "Add restaurant list screen"
git push -u origin feature/3-home

# 4. Open a PR with "Closes #3" in the description, ask the other person to review, then squash merge
gh pr create --fill
```

Before opening a PR: `npm run lint && npm run format:check && npm test && npm run build`.

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the same four checks on every PR and on each push to `main`. The free private repo has no branch protection, so a failing check doesn't block the merge button — don't merge a PR with a red ❌.

Tips to avoid conflicts:
- Split work by screen/flow (e.g. one person on customer ordering, the other on the back-office rider list). Shared files (`router.jsx`, `index.css`, `src/shared/`, `src/data/`) change most often, so keep edits there small.
- Pull `main` often and keep PRs small.
- After a PR is merged: `git checkout main && git pull`, then start a new branch.

## Admin dashboard (A5)

`/admin` shows a sample annual report for 2025 (a completed year): sales **177,321 baht**, **946 orders**, and catalog counts from `menus.length` / `riders.length` (currently 45 / 17). The monthly sales/orders series reconcile with the headline totals; each Top-5 ranking is a share of them (shown as % of sales). The restaurant chart is the running count on the platform; new customers are monthly registrations. All ranking identities are mock data, with restaurant photos and addresses reused from the catalog.

The rider summary derives from `src/data/riders.js`. Recent orders show the five newest records from `useOrders()`, including cancelled orders; their statuses update with the shared `src/shared/hooks/useOrderClock.js`. These demo checkout records are separate from the fixed annual sample report.

Charts support focus, arrow keys, Home/End, previous/next month buttons, and expandable tables with exact values. At 360px, KPIs use two columns and other sections stack vertically. No chart library or backend was added.

## Historical coverage and rider wallet/account screens

A5 now appends a separate **May–November 2022** press-release section: a local, attributed 77-province SVG highlights the 19 service provinces (including Chumphon) and the three usage leaders. Four historical metrics are separate from the unchanged 2025 sample report. `coverage.js` owns names/metrics and matches every province to an SVG id; no map/chart dependency was added.

R5 `/rider/wallet` displays credit/cash balances derived from their ledgers, pending cash withdrawals, signed history, and informational credit channels. R6 `/rider/income` provides Bangkok-calendar daily/monthly reports, a scrollable day strip, exact-value monthly charts/tables, period KPIs and job history. Future months are empty. R7 `/rider/account` shows the shared demo profile/rating distribution, online/auto-accept switches, and read-only details at `/rider/account/profile`, `/rider/account/banks`, `/rider/account/vehicle`.

`useRider()` from `@/state` provides one shared activity/ledger snapshot to R2/R5/R6/R7. The full R2 home from #40 reads it through `useRiderSummary`; R7 uses the existing `useRiderStatus()` store from R2 for both persisted switches. Rider logout clears only the rider session. `riderReports.js` groups the existing activity data without duplicating totals. Completed rider-driven orders from R3–R4 feed today’s income and the cash ledger directly from their order snapshots, once per order id. Timed customer deliveries are excluded; no duplicate income records are persisted.

## Admin map exploration and rider earnings

The A5 map is now the first dashboard section. Hover/focus shows a province’s **fictional 2025 order count**, click/Enter zooms and highlights it with a short ring animation, and Reset/Escape restores Thailand. The 19 allocated province counts sum to the existing 946-order demo KPI; they are explicitly labeled fictional and are separate from both live checkout orders and the 2022 press-release figures (available in the historical-data disclosure). Province zeroes mean no allocation in this demo, not real-world absence of orders.

Below the map, admin rider earnings use the same EA00001 completed-job history as R2/R5/R6: selected-day income, current-month income, highest aggregate day and highest aggregate calendar month within the last 365 Bangkok days. Peak dates/months and job counts are shown. The report covers one demo rider, not earnings for all 17 catalog riders. Daily/monthly charts support keyboard selection and exact-value tables. Map/chart animations respect reduced motion.
