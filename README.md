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
                        RestaurantFilterSheet, AddressSheet
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

Screens not built yet render `ScreenStub` with buttons to the next step, so the whole flow is clickable from day one. Replace the stub when you build the real screen.

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
| `/app/orders/:orderId` | C10 Order tracking |
| `/app/orders` | C11 Order history |
| `/app/account` | C12 Account |
| `/admin/signin` | A1 Back-office sign in |
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
- `add()` returns `{ ok: false, reason: 'different-restaurant' }` when the cart has another store's food — show the "clear cart?" dialog, then call `add(item, restaurant, { replace: true })`.
- **All money comes from `totals`** (`calcTotals` in `src/state/cart.js`): `food`, `delivery`, `storeDiscount`, `couponDiscount`, `total`, `points`, `itemCount`, `minOrder`, `meetsMinOrder`, `couponApplies`. Never recompute amounts in a screen.
- Restaurant/menu data: `getRestaurant(id)`, `findRestaurants({ q, categoryId, type })`, `toCartRestaurant(r)` from `@/data/restaurants`; `getMenu(id)`, `menusOf(restaurantId)` from `@/data/menus` (see `src/data/README.md`).
- Coupons live in `src/data/coupons.js` (`EATSHUB20`, `NEWUSER100`).
- `src/state/fixtures.js` has the spec's sample cart (ราชาอาหาร, 215 ฿ / 9 points) for building screens before the flow is wired up.
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
