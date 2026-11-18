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
  main.jsx, router.jsx  entry + all routes; screen IDs (C1–C12, A1–A3) match REQUIREMENTS.md
  index.css             Tailwind + design tokens (see "Styling" below)
  customer/             customer app
    layouts/            PhoneFrame (phone frame on desktop, full screen on phones),
                        TabLayout (bottom nav ร้านอาหาร · ตะกร้า · ออเดอร์ · บัญชี)
    pages/              C1–C12 screens
    components/         customer-only UI: RestaurantCard, CategoryGrid, BannerCarousel,
                        RestaurantFilterSheet, AddressSheet, MenuCard (C4 items), StarRating,
                        FloatingCartBar (C6)
  admin/                back office
    layouts/            AdminLayout (header, sidebar with ☰ on mobile, footer), adminMenu.js
    pages/              A1 sign-in, A3 rider list
  shared/               used by both apps
    pages/Landing.jsx   choose customer app / back office
    components/         shared UI (see "Shared building blocks" below)
    lib/format.js       formatBaht / formatAmount
    assets/images/      Unsplash food photos (stored in repo, never hotlinked)
  data/                 static mock data from the specs (see src/data/README.md), coupons.js
  state/                cart, orders, session (React Context + localStorage) and fixtures
```

Customer and back-office demo flows are implemented. See [the five-minute demo script](docs/DEMO.md) and [integration QA results](docs/QA.md).

Production deployment is on hold at the user's request. No production URL has been published by this work.

## Customer ordering demo

- Landing has separate customer/back-office entrances. Customer routes require the demo session and return to the requested page after sign-in.
- Checkout reads the real cart, addresses and `calcTotals` output. COD, PromptPay sample QR and PayPal confirmation are simulations; no financial credentials are collected.
- Every order freezes its items, notes, address, totals and `DEFAULT_RIDER`. Order IDs use a persisted sequence beginning after sample order 00012.
- Tracking advances every 8 seconds (about 32 seconds total); the demo skip button survives refresh. COD becomes paid only on delivery.
- History seeds four sample orders once, preserves new orders across refresh and logout, and supports an explicitly empty saved history.
- Logout clears the customer's cart and session while retaining order history. The floating cart bar uses the same final total as Checkout.

## Back-office prototype

Open `/admin/signin` and submit the prefilled `admin` demo form. Visiting `/admin/riders` while signed out redirects to sign-in and then returns to the requested page.
The back office uses the full browser width: mobile rider cards below 1024px and a sortable table on larger screens (the table scrolls horizontally when needed).

- 17 sample riders, search by name/code/phone/vehicle/province, work and account filters, page size and pagination.
- Mobile navigation opens as a modal drawer with Escape, backdrop dismissal and keyboard focus handling.
- Sidebar groups expand to show the original admin sitemap; unsupported actions use the shared mockup toast.
- Active/Block can be changed in page state. Blocking requires a reason and updates the editor and timestamp; reloading resets the sample data.
- Sign-in is a demonstration using `useSession`, not real authentication. Logout clears the admin session and returns to Landing. Add/edit/delete do not change records.
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
| `toast(msg)` / `notInScope()` | from `Toast.jsx`; `notInScope()` shows "ไม่อยู่ในขอบเขต Mockup" for buttons that go nowhere |

**Money**: `formatBaht(215)` → `215 ฿` for prices in lists; `formatAmount(215)` → `215.00` for order summaries.

**State** — `import { useCart, useOrders, useSession } from '@/state'`:

```js
useCart()    // { restaurant, items, noteToStore, noteToRider, coupon, totals,
             //   add(item, restaurant, { replace }), updateQty(key, qty), remove(key), clear(),
             //   setNotes({ noteToStore, noteToRider }), applyCoupon(code), removeCoupon() }
useOrders()  // { orders, createOrder({ cart, address, payment }), getOrder(id), getStatus(order), advance(id) }
useSession() // { customerSignedIn, adminSignedIn, signIn('customer' | 'admin'), signOut(kind) }
useAddress() // { address: { id, label, detail }, addresses, setAddress(id) } — picked on C2, default for C8
useFavorites() // { favorites, isFavorite(id), toggleFavorite(id) } — restaurant ♥
```

- Build cart lines with `makeCartItem({ restaurantId, menu, option, addons, note, qty })` (same choices + note → same `key`, so quantities merge).
- Show a line's choices with `formatChoices(item)` → `สุกี้น้ำ, กุ้ง(15), ลูกชิ้นปลา(10)` (from `@/state`).
- `add()` returns `{ ok: false, reason: 'different-restaurant' }` when the cart has another store's food — show the "clear cart?" dialog, then call `add(item, restaurant, { replace: true })`.
- **All money comes from `totals`** (`calcTotals` in `src/state/cart.js`): `food`, `delivery`, `storeDiscount`, `couponDiscount`, `total`, `points`, `itemCount`, `minOrder`, `meetsMinOrder`, `couponApplies`. Never recompute amounts in a screen.
- Restaurant/menu data: `getRestaurant(id)`, `findRestaurants({ q, categoryId, type })`, `toCartRestaurant(r)` from `@/data/restaurants`; `getMenu(id)`, `menusOf(restaurantId)` from `@/data/menus` (see `src/data/README.md`).
- Coupons live in `src/data/coupons.js` (`EATSHUB20`, `NEWUSER100`).
- `src/state/fixtures.js` has the spec's sample cart (ราชาอาหาร, 215 ฿ / 9 points) for tests; shipped screens read the live cart instead.
- Everything is saved to `localStorage` (keys prefixed `eatshub:`); clear it to reset the demo.

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

Before opening a PR: `npm run lint && npm test && npm run build`.

Tips to avoid conflicts:
- Split work by screen/flow (e.g. one person on customer ordering, the other on the back-office rider list). Shared files (`router.jsx`, `index.css`, `src/shared/`, `src/data/`) change most often, so keep edits there small.
- Pull `main` often and keep PRs small.
- After a PR is merged: `git checkout main && git pull`, then start a new branch.

## Admin dashboard (A5)

`/admin` shows a sample annual report for 2025 (a completed year): sales **177,321 baht**, **946 orders**, and catalog counts from `menus.length` / `riders.length` (currently 45 / 17). The monthly sales/orders series reconcile with the headline totals; each Top-5 ranking is a share of them (shown as % of sales). The restaurant chart is the running count on the platform; new customers are monthly registrations. All ranking identities are mock data, with restaurant photos and addresses reused from the catalog.

The rider summary derives from `src/data/riders.js`. Recent orders show the five newest records from `useOrders()`, including cancelled orders; their statuses update with the shared `src/shared/hooks/useOrderClock.js`. These demo checkout records are separate from the fixed annual sample report.

Charts support focus, arrow keys, Home/End, previous/next month buttons, and expandable tables with exact values. At 360px, KPIs use two columns and other sections stack vertically. No chart library or backend was added.
