# eatsHub Mockup

**English** · [ภาษาไทย](#eatshub-mockup-ภาษาไทย)

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
  main.jsx, router.jsx  entry + all routes; screen IDs (C1–C13, R1–R8, A1–A5) match REQUIREMENTS.md
  index.css             Tailwind + design tokens (see "Styling" below)
  customer/             customer app
    layouts/            TabLayout (bottom nav ร้านอาหาร · ตะกร้า · ออเดอร์ · บัญชี)
    pages/              C1–C13 screens (C13 chat with the rider)
    components/         customer-only UI: RestaurantCard, CategoryGrid, BannerCarousel,
                        RestaurantFilterSheet, AddressSheet, MenuCard (C4 items), StarRating,
                        FloatingCartBar (C6), OrderHistoryCard (C11)
  rider/                rider app (R1–R8, scope in REQUIREMENTS §4.1; issues #34–#38)
    layouts/            RiderTabLayout (dark bottom nav หน้าแรก · กระเป๋าเงิน · รายได้ · บัญชี)
    pages/              R1 sign-in, R2 home (+ R3 popup), R4 job + earnings summary, R5 wallets, R6 income, R7 account, R8 chat with the customer
    components/         RequireRider (demo route guard), Switch, StatsSheet (R2 pull-up sheet),
                        JobOfferDialog (R3), SignaturePad (R4)
    useRiderSummary.js  wallet balances + today's numbers shared by R2 and R5
    useDemoCustomerReply.js  simulated customer answers the rider on demo jobs (R4, R8)
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
- During "ส่งอาหาร" (rider on the way to the customer) C10 shows a drawn mock map instead of the illustration: a motorbike moving along a highlighted route to the customer's pin, with distance and minutes left. A rider-driven order's motorbike stops just short of the door until the rider app marks it delivered.
- If the rider app is signed in and online when the order is placed, the order is offered to the rider instead: it waits at stage 1 for up to 45 seconds (R3 popup, or taken at once with auto-accept). Once accepted, only the rider's buttons on R4 move it (no skip button on C10); if nobody accepts (or the rider taps reject), the clock takes over from stage 2. With the rider app signed out or offline, tracking runs on the clock as before.
- The rider app also works on its own: online and idle on R2 for about 5 seconds, it offers itself a simulated job built from real restaurant/menu data (`createDemoJob`, `simulated: true`). Simulated jobs are hidden from the customer's history and the back office's recent orders, but delivered ones count in R6 income. Real customer orders are offered first: placing one drops any unfinished simulated job (offered or in progress) so the rider is free for it; if the rider is busy with another customer order, the new one follows the clock instead. Auto-accept starts off so the R3 popup (reject / accept) is visible.
- Once the rider app has accepted an order, the rider (R4 → R8) and the customer (C10 → C13) can chat until delivery; afterwards the thread is read-only. Messages are stored on the order, so two windows update each other, and each side gets an unread badge. On simulated jobs a demo customer answers the rider's latest message after about 2.5 seconds. Timed orders (no rider app) have no chat.
- Orders are shared through `localStorage` and every tab listens for changes, so the customer app and rider app can run side by side in two windows (or by switching apps in one tab) and follow each other.
- Once delivered, the customer rates the order once via `rate(id, { rider, restaurant, review })`, Grab/LINE MAN style: rider stars (1–5) are required, restaurant stars and a review (≤ 200 chars) are optional. A back-to-home button is shown before and after rating. The history tab's "เขียนรีวิว" opens the same sheet.
- History seeds four sample orders once, preserves new orders across refresh and logout, and supports an explicitly empty saved history.
- Logout clears the customer's cart and session while retaining order history. The floating cart bar uses the same final total as Checkout.

## Back-office prototype

Open `/admin/signin` and submit the prefilled `admin` demo form. Visiting `/admin/riders` while signed out redirects to sign-in and then returns to the requested page.
The back office uses the full browser width: mobile rider cards below 1024px and a sortable table on larger screens (the table scrolls horizontally when needed).

- 17 sample riders, search by name/code/phone/vehicle/province, status filter chips with counts (all · Online · Delivery · Offline · blocked; scroll sideways on phones), page size and pagination. Blocked riders are tinted in the list.
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
| `/app/orders/:orderId/chat` | C13 Chat with the rider (orders the rider app accepted) |
| `/app/orders` | C11 Order history |
| `/app/account` | C12 Account |
| `/app/account/favorites` | C12 sub-page: favorite restaurants |
| `/rider/signin` | R1 Rider sign in |
| `/rider` | R2 Rider home (+ R3 new-job popup) |
| `/rider/jobs/:orderId` | R4 Delivery in progress + earnings summary |
| `/rider/jobs/:orderId/chat` | R8 Chat with the customer |
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
| `ChatThread` | R8/C13 chat: `order`, `side` (`rider` \| `customer`), `now`, `otherName`, `onSend(text)`; quick replies + sticky input while open, read-only after delivery |
| `ChatButton` | secondary button to the chat with an unread badge: `to`, `unread` |
| `toast(msg)` | from `Toast.jsx`; shows a short message in the nearest `<Toaster />` |

**Money**: `formatBaht(215)` → `215 ฿` for prices in lists; `formatAmount(215)` → `215.00` for order summaries.

**State** — `import { useCart, useOrders, useSession, useRiderStatus } from '@/state'`:

```js
useCart()    // { restaurant, items, noteToStore, noteToRider, coupon, totals,
             //   add(item, restaurant, { replace }), updateQty(key, qty), remove(key), clear(),
             //   setNotes({ noteToStore, noteToRider }), applyCoupon(code), removeCoupon() }
useOrders()  // { orders, createOrder({ cart, address, payment }), getOrder(id), getStatus(order), advance(id), rate(id, { rider, restaurant, review }),
             //   riderOrders, offerDemoJob(), acceptJob(id, { auto }), rejectJob(id), advanceJob(id, fromStage) } — rider side (R3–R4)
             //   `orders` leaves out simulated rider jobs; `riderOrders` includes them
             //   sendMessage(id, 'rider' | 'customer', text), markChatRead(id, side), demoReply(id) — chat (R8/C13, rules in state/chat.js)
useSession() // { customerSignedIn, adminSignedIn, riderSignedIn, signIn('customer' | 'admin' | 'rider'), signOut(kind) }
useAddress() // { address: { id, label, detail }, addresses, setAddress(id) } — picked on C2, default for C8
useFavorites() // { favorites, isFavorite(id), toggleFavorite(id) } — restaurant ♥
useRiderStatus() // { online, autoAccept, setOnline(bool), setAutoAccept(bool) } — rider switches (R2, R7); default online on, auto-accept off
```

- Build cart lines with `makeCartItem({ restaurantId, menu, option, addons, note, qty })` (same choices + note → same `key`, so quantities merge).
- Show a line's choices with `formatChoices(item)` → `สุกี้น้ำ, กุ้ง(15), ลูกชิ้นปลา(10)` (from `@/state`).
- `add()` returns `{ ok: false, reason: 'different-restaurant' }` when the cart has another store's food — show the "clear cart?" dialog, then call `add(item, restaurant, { replace: true })`.
- **All money comes from `totals`** (`calcTotals` in `src/state/cart.js`): `food`, `delivery`, `storeDiscount`, `couponDiscount`, `total`, `points`, `itemCount`, `minOrder`, `meetsMinOrder`, `couponApplies`. Never recompute amounts in a screen.
- Restaurant/menu data: `getRestaurant(id)`, `findRestaurants({ q, categoryId, type })`, `toCartRestaurant(r)` from `@/data/restaurants`; `getMenu(id)`, `menusOf(restaurantId)` from `@/data/menus` (see `src/data/README.md`).
- Coupons live in `src/data/coupons.js` (`EATSHUB20`, `NEWUSER100`).
- `src/state/fixtures.js` has the spec's sample cart (ราชาอาหาร, 215 ฿ / 9 points) for tests; shipped screens read the live cart instead.
- Rider jobs (`src/state/orders.js`): `canAcceptJob(order)`, `acceptJob`, `advanceJob` and `stepTimes(order)` (when each stage was reached, for C10). `deliveryLeg(order, now, distanceKm)` gives the C10 map's progress, km and minutes left during "ส่งอาหาร" (null otherwise). An offered order carries `jobOfferExpiresAt`; an accepted one carries `riderJob: { step, times, auto? }`. Nothing else in the order snapshot changes. `isRiderOnDuty()` (`src/state/preferences.js`) decides whether a new order is offered.
- Everything is saved to `localStorage` (keys prefixed `eatshub:`); clear it to reset the demo. `subscribe(key, callback)` in `src/state/storage.js` delivers changes made by other tabs. It always hands over the value stored now (events can arrive late), and `useOrders()` applies every change to the latest saved list, so two windows changing orders at once don't undo each other.

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

`/admin` has three sections, in this order: **2025 overview** (a completed sample year), **riders · last 30 days**, and **recent orders**. The overview shows four KPIs (sales **177,321 baht**, **946 orders**, average order value **187 baht**, **295** new customers), each with its second-half vs first-half change from `halfYearGrowth`, then the province map, the monthly sales chart and the Top 5 restaurants (each shown as % of sales). The monthly series reconcile with the headline totals. Restaurant photos are reused from the catalog. Menu/rider catalog counts, the restaurant and new-customer charts and the Top 5 customers were removed on 20 Nov 2026 to keep only what an executive needs.

The live rider states (ready / delivering / offline, blocked overlapping) derive from `src/data/riders.js` and sit in the rider section. Recent orders show the five newest records from `useOrders()`, including cancelled orders; their statuses update with the shared `src/shared/hooks/useOrderClock.js`. These demo checkout records are separate from the fixed annual sample report.

Charts support focus, arrow keys, Home/End, a previous/next month stepper, and expandable tables with exact values. At 360px, KPIs use two columns and other sections stack vertically. No chart library or backend was added.

## Historical coverage and rider wallet/account screens

A5 shows a local, attributed 77-province SVG that highlights the 19 service provinces from the **May–November 2022** press release (including Chumphon) and the three usage leaders, separate from the 2025 sample report. The release's headline figures were removed in #43. `coverage.js` owns province names and matches every province to an SVG id; no map/chart dependency was added.

R5 `/rider/wallet` displays credit/cash balances derived from their ledgers, pending cash withdrawals, signed history, and informational credit channels. R6 `/rider/income` provides Bangkok-calendar daily/monthly reports, a scrollable day strip, exact-value monthly charts/tables, period KPIs and job history. Future months are empty. R7 `/rider/account` shows the shared demo profile/rating distribution, online/auto-accept switches, and read-only details at `/rider/account/profile`, `/rider/account/banks`, `/rider/account/vehicle`. The three tab screens share `RiderTabHeader` (title, no back button — the bottom tabs navigate); on R5 the two balance cards are also the tabs that switch the history.

`useRider()` from `@/state` provides one shared activity/ledger snapshot to R2/R5/R6/R7. The full R2 home from #40 reads it through `useRiderSummary`; R7 uses the existing `useRiderStatus()` store from R2 for both persisted switches. Rider logout clears only the rider session. `riderReports.js` groups the existing activity data without duplicating totals. Completed rider-driven orders from R3–R4 feed today’s income and the cash ledger directly from their order snapshots, once per order id. Timed customer deliveries are excluded; no duplicate income records are persisted.

## Admin map exploration and rider earnings

The A5 map follows the overview KPIs. Hover/focus shows a province’s **fictional 2025 order count**, click/Enter zooms and highlights it with a short ring animation, and Reset/Escape restores Thailand. The 19 allocated province counts sum to the existing 946-order demo KPI; they are explicitly labeled fictional and are separate from both live checkout orders and the 2022 service-province list. Province zeroes mean no allocation in this demo, not real-world absence of orders. Beside the map are the selected province and a ranked province list (top 6, expandable to all 19).

After the overview, **riders · last 30 days** (#43, `RiderPerformance.jsx` + `RushHourChart.jsx`) covers all 17 catalog riders over the same 30 Bangkok days as the R6 day strip: four team figures (completed jobs, job-weighted average delivery time, acceptance rate, job-weighted rating), the live rider states, a Top 5 of active riders (jobs, rating, acceptance; blocked riders are excluded from the ranking but counted in the figures) and an hourly rush chart of orders vs online riders per day with the busiest two hours per rider highlighted and an exact-value table. EA00001 reads the shared `useRider()` activity, so its numbers match R6; the other 16 riders are deterministic fictional data. Map animations respect reduced motion.

---

# eatsHub Mockup (ภาษาไทย)

[English](#eatshub-mockup) · **ภาษาไทย**

Mockup แบบคลิกได้ของแพลตฟอร์มสั่งอาหาร eatsHub ออกแบบสำหรับมือถือเป็นหลัก (mobile-first) และ deploy บน Vercel

## รันบนเครื่อง

ต้องใช้ Node 20.19 ขึ้นไป

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build สำหรับ production ลงใน dist/
npm run lint     # ESLint
npm test         # Vitest (กฎการคำนวณเงินใน src/state/cart.js)
npm run format   # Prettier — รันก่อน commit
```

Deploy บน Vercel เป็น static Vite site (`vercel.json` rewrite ทุก path ไปที่ `index.html` เพื่อให้เปิดลิงก์ตรงไปหน้าใดก็ได้)

## โครงสร้างโปรเจกต์

```
brand/                  ไฟล์โลโก้ (สีหลัก #FCBB18) import ผ่าน @brand/...
docs/REQUIREMENTS.md    scope ของ mockup, การตัดสินใจ, เกณฑ์ว่าเสร็จ (แหล่งอ้างอิงหลัก)
docs/specs/             สเปกแต่ละโมดูล สรุปจาก PDF ต้นฉบับ
src/
  main.jsx, router.jsx  จุดเริ่มต้น + route ทั้งหมด; รหัสหน้าจอ (C1–C13, R1–R8, A1–A5) ตรงกับ REQUIREMENTS.md
  index.css             Tailwind + design tokens (ดู "การจัดสไตล์" ด้านล่าง)
  customer/             แอปลูกค้า
    layouts/            TabLayout (bottom nav ร้านอาหาร · ตะกร้า · ออเดอร์ · บัญชี)
    pages/              หน้าจอ C1–C13 (C13 แชทกับไรเดอร์)
    components/         UI เฉพาะแอปลูกค้า: RestaurantCard, CategoryGrid, BannerCarousel,
                        RestaurantFilterSheet, AddressSheet, MenuCard (รายการใน C4), StarRating,
                        FloatingCartBar (C6), OrderHistoryCard (C11)
  rider/                แอปไรเดอร์ (R1–R8, scope ใน REQUIREMENTS §4.1; issue #34–#38)
    layouts/            RiderTabLayout (bottom nav สีเข้ม หน้าแรก · กระเป๋าเงิน · รายได้ · บัญชี)
    pages/              R1 sign in, R2 หน้าแรก (+ popup R3), R4 งาน + สรุปรายได้, R5 กระเป๋าเงิน, R6 รายได้, R7 บัญชี, R8 แชทกับลูกค้า
    components/         RequireRider (route guard แบบ demo), Switch, StatsSheet (sheet ดึงขึ้นใน R2),
                        JobOfferDialog (R3), SignaturePad (R4)
    useRiderSummary.js  ยอดกระเป๋าเงิน + ตัวเลขของวันนี้ ใช้ร่วมกันใน R2 และ R5
    useDemoCustomerReply.js  ลูกค้าจำลองตอบไรเดอร์ในงานจำลอง (R4, R8)
  admin/                ระบบหลังบ้าน
    layouts/            AdminLayout (header, sidebar พร้อมปุ่ม ☰ บนมือถือ, footer), adminMenu.js
    pages/              A1 sign in, A3 รายชื่อไรเดอร์
  shared/               ใช้ร่วมกันมากกว่าหนึ่งแอป
    pages/Landing.jsx   เลือกแอปลูกค้า / แอปไรเดอร์ / ระบบหลังบ้าน
    components/         UI ที่ใช้ร่วมกัน (ดู "ชิ้นส่วนที่ใช้ร่วมกัน" ด้านล่าง)
    lib/format.js       formatBaht / formatAmount
    assets/images/      รูปอาหารจาก Unsplash + rider-map.svg (เก็บใน repo ไม่ hotlink)
  data/                 mock data แบบ static จากสเปก (ดู src/data/README.md), coupons.js
  state/                ตะกร้า, ออเดอร์, session (React Context + localStorage) และ fixtures
```

flow demo ของแอปลูกค้าและระบบหลังบ้านทำเสร็จแล้ว ดู[สคริปต์เดโม 5 นาที](docs/DEMO.md) และ[ผล QA แบบ integration](docs/QA.md)

Production: **https://eatshub-red.vercel.app** โปรเจกต์ Vercel เชื่อมกับ repo นี้ ทุกครั้งที่ merge เข้า `main` จะ deploy production อัตโนมัติ และทุก PR จะได้ preview URL ของตัวเอง

## เดโมการสั่งอาหาร (แอปลูกค้า)

- หน้า Landing มีทางเข้าแยกสำหรับลูกค้า ไรเดอร์ และระบบหลังบ้าน (3 คอลัมน์ตั้งแต่ขนาด `md` ขึ้นไป) route ของลูกค้าต้องมี demo session และหลัง sign in จะกลับไปหน้าที่ขอไว้
- Checkout อ่านจากตะกร้าจริง ที่อยู่ และผลลัพธ์ของ `calcTotals` การชำระแบบ COD, QR PromptPay ตัวอย่าง และหน้ายืนยัน PayPal เป็นการจำลองทั้งหมด ไม่มีการเก็บข้อมูลทางการเงินใด ๆ
- ทุกออเดอร์จะ freeze รายการอาหาร หมายเหตุ ที่อยู่ ยอดเงิน และ `DEFAULT_RIDER` ไว้ ณ ตอนสร้าง เลขออเดอร์ใช้ลำดับที่บันทึกไว้ เริ่มต่อจากออเดอร์ตัวอย่าง 00012
- การติดตามออเดอร์เดินไปทีละขั้นทุก 8 วินาที (รวมประมาณ 32 วินาที) ปุ่มข้ามสำหรับเดโมยังอยู่แม้ refresh หน้า ออเดอร์ COD จะเปลี่ยนเป็นชำระแล้วเมื่อจัดส่งเรียบร้อยเท่านั้น
- ระหว่างขั้น "ส่งอาหาร" (ไรเดอร์กำลังมาหาลูกค้า) C10 แสดงแผนที่จำลองแทนภาพประกอบ: มอเตอร์ไซค์วิ่งตามเส้นทางไฮไลต์ไปหาหมุดลูกค้า พร้อมระยะทางและเวลาที่เหลือ ออเดอร์ที่ไรเดอร์ถือ มอเตอร์ไซค์จะหยุดก่อนถึงหน้าบ้านจนกว่าแอปไรเดอร์จะกดส่งอาหารแล้ว
- ถ้าแอปไรเดอร์ sign in และ online อยู่ตอนสั่งอาหาร ออเดอร์จะถูกเสนอให้ไรเดอร์แทน โดยรออยู่ที่ขั้นที่ 1 ได้นานสุด 45 วินาที (popup R3 หรือรับทันทีถ้าเปิดรับงานอัตโนมัติ) เมื่อรับงานแล้ว จะเดินขั้นได้เฉพาะจากปุ่มของไรเดอร์ใน R4 (ไม่มีปุ่มข้ามใน C10) ถ้าไม่มีใครรับ (หรือไรเดอร์กดปฏิเสธ) ระบบเวลาจะเดินต่อตั้งแต่ขั้นที่ 2 ถ้าแอปไรเดอร์ sign out หรือ offline การติดตามจะเดินตามเวลาเหมือนเดิม
- แอปไรเดอร์ใช้งานเดี่ยว ๆ ได้ด้วย: ถ้าออนไลน์และว่างอยู่ที่ R2 ราว 5 วินาที จะเสนองานจำลองที่สร้างจากร้าน/เมนูจริง (`createDemoJob`, `simulated: true`) งานจำลองไม่แสดงในประวัติออเดอร์ของลูกค้าและออเดอร์ล่าสุดของหลังบ้าน แต่งานที่ส่งเสร็จนับเข้ารายได้ R6 ออเดอร์จริงของลูกค้าจะถูกเสนอก่อน: ตอนลูกค้าสั่ง งานจำลองที่ยังไม่ส่งเสร็จ (รอรับหรือกำลังทำ) จะถูกลบเพื่อให้ไรเดอร์ว่างรับออเดอร์จริง ถ้าไรเดอร์กำลังทำออเดอร์ของลูกค้าคนอื่นอยู่ ออเดอร์ใหม่จะเดินตามเวลาแทน รับงานอัตโนมัติเริ่มต้นเป็นปิด เพื่อให้เห็น popup R3 (ปฏิเสธ / รับงาน)
- เมื่อแอปไรเดอร์รับออเดอร์แล้ว ไรเดอร์ (R4 → R8) กับลูกค้า (C10 → C13) แชทกันได้จนส่งเสร็จ หลังจากนั้นอ่านได้อย่างเดียว ข้อความเก็บไว้กับออเดอร์ จึงอัปเดตข้ามสองหน้าต่างได้ และแต่ละฝั่งมี badge ข้อความใหม่ ในงานจำลอง ลูกค้าจำลองจะตอบข้อความล่าสุดของไรเดอร์ในราว 2.5 วินาที ออเดอร์ที่เดินตามเวลา (ไม่มีแอปไรเดอร์) ไม่มีแชท
- ออเดอร์แชร์ผ่าน `localStorage` และทุกแท็บฟังการเปลี่ยนแปลง จึงเปิดแอปลูกค้าและแอปไรเดอร์คู่กันสองหน้าต่าง (หรือสลับแอปในแท็บเดียว) แล้วเห็นความคืบหน้าตรงกันได้
- เมื่อจัดส่งเรียบร้อย ลูกค้าให้คะแนนออเดอร์ได้ครั้งเดียวผ่าน `rate(id, { rider, restaurant, review })` แบบ Grab/LINE MAN: ดาวไรเดอร์ (1–5) บังคับ ส่วนดาวร้านค้าและรีวิว (ไม่เกิน 200 ตัวอักษร) ไม่บังคับ มีปุ่มกลับหน้าแรกทั้งก่อนและหลังให้คะแนน ปุ่ม "เขียนรีวิว" ในแท็บประวัติจะเปิด sheet เดียวกัน
- ประวัติออเดอร์ใส่ออเดอร์ตัวอย่าง 4 รายการครั้งแรกครั้งเดียว ออเดอร์ใหม่ยังอยู่หลัง refresh และ logout และรองรับกรณีที่ประวัติถูกบันทึกว่าว่างจริง ๆ
- Logout จะล้างตะกร้าและ session ของลูกค้า แต่เก็บประวัติออเดอร์ไว้ แถบตะกร้าลอยแสดงยอดรวมสุดท้ายตัวเดียวกับหน้า Checkout

## ต้นแบบระบบหลังบ้าน

เปิด `/admin/signin` แล้วกดส่งฟอร์ม demo `admin` ที่กรอกไว้แล้ว ถ้าเข้า `/admin/riders` ตอนยังไม่ได้ sign in จะถูกพาไปหน้า sign in แล้วกลับมาหน้าที่ขอไว้
ระบบหลังบ้านใช้ความกว้างเต็มเบราว์เซอร์: ต่ำกว่า 1024px แสดงรายชื่อไรเดอร์เป็นการ์ด ส่วนจอใหญ่กว่านั้นเป็นตารางที่เรียงลำดับได้ (ตารางเลื่อนแนวนอนได้เมื่อจำเป็น)

- ไรเดอร์ตัวอย่าง 17 คน ค้นหาด้วยชื่อ/รหัส/เบอร์โทร/ทะเบียนรถ/จังหวัด ปุ่มกรองสถานะพร้อมจำนวน (ทั้งหมด · พร้อมรับงาน · กำลังจัดส่ง · ออฟไลน์ · ระงับใช้งาน บนมือถือเลื่อนแนวนอนได้) เลือกจำนวนต่อหน้าและแบ่งหน้า ไรเดอร์ที่ถูกระงับจะมีพื้นแถวสีแดงอ่อน
- เมนูบนมือถือเปิดเป็น drawer แบบ modal ปิดได้ด้วย Escape หรือกดพื้นหลัง และจัดการ focus ของคีย์บอร์ด
- Sidebar แสดงเฉพาะหน้าที่มีอยู่จริง (แดชบอร์ด, จัดการไรเดอร์, ออกจากระบบ) หน้าหลังบ้านที่ยังไม่ได้ทำจะถูกซ่อน ไม่แสดงเป็นลิงก์ที่กดไม่ได้
- เปลี่ยน Active/Block ได้ใน state ของหน้า การ Block ต้องใส่เหตุผล และจะอัปเดตผู้แก้ไขกับเวลา เมื่อ reload ข้อมูลตัวอย่างจะกลับเป็นค่าเริ่มต้น
- Sign in เป็นการสาธิตผ่าน `useSession` ไม่ใช่การยืนยันตัวตนจริง Logout จะล้าง session ของแอดมินแล้วกลับไปหน้า Landing
- ไม่มี API หรือฐานข้อมูล ข้อมูลไรเดอร์อยู่ใน `src/data/riders.js`
- `DEFAULT_RIDER` export ไรเดอร์ EA00001 ไว้ใช้ใน checkout/ติดตามออเดอร์ วันที่ของไรเดอร์สร้างขึ้นโดยอิงจากเวลาปัจจุบัน

ให้รันคำสั่งในโฟลเดอร์ `eatshub` ด้านในที่มี `package.json` ถ้า terminal อยู่ที่โฟลเดอร์ด้านนอก ให้รัน `cd .\eatshub` ก่อน

| Route | หน้าจอ |
|---|---|
| `/` | Landing |
| `/app/signin` | C1 Sign In |
| `/app` | C2 หน้าแรก |
| `/app/search` | C3 ค้นหา / หมวดอาหาร |
| `/app/restaurant/:restaurantId` | C4 ร้านอาหาร (+ C6 แถบตะกร้าลอย) |
| `/app/restaurant/:restaurantId/menu/:menuId` | C5 รายละเอียดเมนู |
| `/app/cart` | C7 ตะกร้า |
| `/app/checkout` | C8 Checkout |
| `/app/payment/:method` | C9 ชำระเงิน (`promptpay` / `paypal`) |
| `/app/success/:orderId` | สั่งซื้อ/ชำระเงินสำเร็จ (refresh ได้) |
| `/app/orders/:orderId` | C10 ติดตามออเดอร์ |
| `/app/orders/:orderId/chat` | C13 แชทกับไรเดอร์ (ออเดอร์ที่แอปไรเดอร์รับ) |
| `/app/orders` | C11 ประวัติออเดอร์ |
| `/app/account` | C12 บัญชี |
| `/app/account/favorites` | หน้าย่อย C12: ร้านค้าที่ถูกใจ |
| `/rider/signin` | R1 ไรเดอร์ Sign In |
| `/rider` | R2 หน้าแรกไรเดอร์ (+ R3 popup งานใหม่) |
| `/rider/jobs/:orderId` | R4 ระหว่างส่ง + สรุปรายได้ |
| `/rider/jobs/:orderId/chat` | R8 แชทกับลูกค้า |
| `/rider/wallet` | R5 กระเป๋าเงิน |
| `/rider/income` | R6 รายได้ |
| `/rider/account` | R7 บัญชี |
| `/admin/signin` | A1 Sign In ระบบหลังบ้าน |
| `/admin` | A5 แดชบอร์ด (หน้าแรกหลังแอดมิน sign in) |
| `/admin/riders` | A3 รายชื่อไรเดอร์ |

## การจัดสไตล์

ใช้ token ใน `src/index.css` ห้ามเขียนค่า hex ตรง ๆ:

| Token | ใช้กับ |
|---|---|
| `brand` / `brand-dark` / `brand-light` | ปุ่มหลัก, แท็บที่เลือก, แถบตะกร้าลอย, footer ระบบหลังบ้าน |
| `ink` / `muted` | ข้อความหลัก / ข้อความรอง |
| `surface` | พื้นหลังเนื้อหาระบบหลังบ้าน, เส้นแบ่ง section ในแอป |
| `admin` / `admin-dark` | sidebar ระบบหลังบ้านและพื้นหลังหน้า sign in |
| `success` · `danger` · `warning` · `info` (+ `-light`) | badge และสีสถานะ |
| `status-online` · `status-offline` · `status-delivery` | สถานะไรเดอร์ (alias ของสีด้านบน) |

รูปทรง: การ์ด `rounded-2xl` ปุ่ม `rounded-xl` ฟอนต์: Montserrat สำหรับอักษรละติน/ตัวเลข และ IBM Plex Sans Thai สำหรับภาษาไทย (ตั้งไว้ใน `font-sans` แล้ว)

ภายในกรอบโทรศัพท์ ให้ใช้ `sticky`/`absolute` แทน `fixed` เพื่อให้แถบต่าง ๆ อยู่ในกรอบโทรศัพท์เมื่อเปิดบน desktop

## ชิ้นส่วนที่ใช้ร่วมกัน

**Components** (`src/shared/components/`):

| Component | หมายเหตุ |
|---|---|
| `Button` | `variant="primary" \| "secondary" \| "ghost"`, `size="sm" \| "md" \| "lg"`, `block`, `to="/path"` จะ render เป็น Link |
| `Card` | กล่องขาว `rounded-2xl`; ใช้ `padded={false}` กับรูปหรือรายการ |
| `Badge` | `tone="success" \| "danger" \| "warning" \| "info" \| "brand" \| "neutral"`, `solid` สำหรับแบบทึบ |
| `TopBar` | ปุ่มย้อนกลับแบบ sticky + ชื่อหน้า; `backTo`, `right`, `transparent` (วางทับรูปปก) |
| `BottomSheet` | `open`, `onClose`, `title`, `footer`; อยู่ในกรอบโทรศัพท์ |
| `ConfirmDialog` | dialog ใช่/ไม่ใช่ กลางจอ: `open`, `title`, `confirmLabel`, `onConfirm`, `onCancel`; อยู่ในกรอบโทรศัพท์ |
| `ChatThread` | แชท R8/C13: `order`, `side` (`rider` \| `customer`), `now`, `otherName`, `onSend(text)`; มีข้อความด่วน + ช่องพิมพ์แบบ sticky ระหว่างแชทได้ หลังส่งเสร็จอ่านอย่างเดียว |
| `ChatButton` | ปุ่ม secondary ไปหน้าแชท พร้อม badge ข้อความใหม่: `to`, `unread` |
| `toast(msg)` | จาก `Toast.jsx`; แสดงข้อความสั้น ๆ ใน `<Toaster />` ที่ใกล้ที่สุด |

**เงิน**: `formatBaht(215)` → `215 ฿` สำหรับราคาในรายการ; `formatAmount(215)` → `215.00` สำหรับสรุปออเดอร์

**State** — `import { useCart, useOrders, useSession, useRiderStatus } from '@/state'`:

```js
useCart()    // { restaurant, items, noteToStore, noteToRider, coupon, totals,
             //   add(item, restaurant, { replace }), updateQty(key, qty), remove(key), clear(),
             //   setNotes({ noteToStore, noteToRider }), applyCoupon(code), removeCoupon() }
useOrders()  // { orders, createOrder({ cart, address, payment }), getOrder(id), getStatus(order), advance(id), rate(id, { rider, restaurant, review }),
             //   riderOrders, offerDemoJob(), acceptJob(id, { auto }), rejectJob(id), advanceJob(id, fromStage) } — ฝั่งไรเดอร์ (R3–R4)
             //   `orders` ไม่รวมงานจำลองของไรเดอร์ ส่วน `riderOrders` รวมด้วย
             //   sendMessage(id, 'rider' | 'customer', text), markChatRead(id, side), demoReply(id) — แชท (R8/C13, กฎอยู่ใน state/chat.js)
useSession() // { customerSignedIn, adminSignedIn, riderSignedIn, signIn('customer' | 'admin' | 'rider'), signOut(kind) }
useAddress() // { address: { id, label, detail }, addresses, setAddress(id) } — เลือกใน C2 และเป็นค่าเริ่มต้นใน C8
useFavorites() // { favorites, isFavorite(id), toggleFavorite(id) } — ร้านที่กด ♥
useRiderStatus() // { online, autoAccept, setOnline(bool), setAutoAccept(bool) } — สวิตช์ของไรเดอร์ (R2, R7); ค่าเริ่มต้นออนไลน์เปิด รับงานอัตโนมัติปิด
```

- สร้างรายการในตะกร้าด้วย `makeCartItem({ restaurantId, menu, option, addons, note, qty })` (ตัวเลือกและหมายเหตุเหมือนกัน → `key` เดียวกัน จำนวนจึงรวมกัน)
- แสดงตัวเลือกของรายการด้วย `formatChoices(item)` → `สุกี้น้ำ, กุ้ง(15), ลูกชิ้นปลา(10)` (จาก `@/state`)
- `add()` คืนค่า `{ ok: false, reason: 'different-restaurant' }` เมื่อตะกร้ามีอาหารจากร้านอื่นอยู่ ให้แสดง dialog "ล้างตะกร้า?" แล้วเรียก `add(item, restaurant, { replace: true })`
- **ยอดเงินทั้งหมดมาจาก `totals`** (`calcTotals` ใน `src/state/cart.js`): `food`, `delivery`, `storeDiscount`, `couponDiscount`, `total`, `points`, `itemCount`, `minOrder`, `meetsMinOrder`, `couponApplies` ห้ามคำนวณยอดเงินใหม่ในหน้าจอ
- ข้อมูลร้าน/เมนู: `getRestaurant(id)`, `findRestaurants({ q, categoryId, type })`, `toCartRestaurant(r)` จาก `@/data/restaurants`; `getMenu(id)`, `menusOf(restaurantId)` จาก `@/data/menus` (ดู `src/data/README.md`)
- คูปองอยู่ใน `src/data/coupons.js` (`EATSHUB20`, `NEWUSER100`)
- `src/state/fixtures.js` มีตะกร้าตัวอย่างตามสเปก (ราชาอาหาร, 215 ฿ / 9 คะแนน) สำหรับใช้ในเทสต์เท่านั้น หน้าจอจริงอ่านจากตะกร้าจริง
- งานไรเดอร์ (`src/state/orders.js`): `canAcceptJob(order)`, `acceptJob`, `advanceJob` และ `stepTimes(order)` (เวลาที่ถึงแต่ละขั้น ใช้ใน C10) `deliveryLeg(order, now, distanceKm)` ให้ความคืบหน้า ระยะทาง (กม.) และเวลาที่เหลือของแผนที่ C10 ระหว่างขั้น "ส่งอาหาร" (ขั้นอื่นได้ null) ออเดอร์ที่ถูกเสนอจะมี `jobOfferExpiresAt` ออเดอร์ที่รับแล้วจะมี `riderJob: { step, times, auto? }` ส่วนอื่นของ snapshot ออเดอร์ไม่เปลี่ยน `isRiderOnDuty()` (`src/state/preferences.js`) เป็นตัวตัดสินว่าจะเสนอออเดอร์ใหม่ให้ไรเดอร์หรือไม่
- ทุกอย่างบันทึกใน `localStorage` (key ขึ้นต้นด้วย `eatshub:`) ล้างออกเพื่อรีเซ็ตเดโม `subscribe(key, callback)` ใน `src/state/storage.js` ส่งต่อการเปลี่ยนแปลงที่เกิดจากแท็บอื่น โดยส่งค่าที่อยู่ใน storage ตอนนี้เสมอ (event อาจมาช้า) และ `useOrders()` แก้ไขจากรายการล่าสุดที่บันทึกไว้ทุกครั้ง สองหน้าต่างที่แก้พร้อมกันจึงไม่ทับกัน

## การทำงานร่วมกัน (2 คน)

`main` คือ branch ที่พร้อม deploy — ห้าม push เข้าไปตรง ๆ ให้ทำงานบน branch แล้วเปิด Pull Request

```bash
# 1. เริ่มจาก main ล่าสุด
git checkout main
git pull

# 2. สร้าง branch สำหรับ issue: feature/<เลข issue>-<ชื่อสั้น ๆ>
git checkout -b feature/3-home

# 3. commit และ push งาน
git add .
git commit -m "Add restaurant list screen"
git push -u origin feature/3-home

# 4. เปิด PR โดยใส่ "Closes #3" ใน description ขอให้อีกคนรีวิว แล้ว squash merge
gh pr create --fill
```

ก่อนเปิด PR: `npm run lint && npm run format:check && npm test && npm run build`

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) รันการตรวจทั้ง 4 อย่างนี้กับทุก PR และทุกครั้งที่ push เข้า `main` repo ส่วนตัวแบบฟรีไม่มี branch protection ดังนั้นถ้าตรวจไม่ผ่านก็ยังกดปุ่ม merge ได้ — อย่า merge PR ที่ขึ้น ❌ สีแดง

เคล็ดลับลด conflict:
- แบ่งงานตามหน้าจอ/flow (เช่น คนหนึ่งทำการสั่งอาหารฝั่งลูกค้า อีกคนทำรายชื่อไรเดอร์ในระบบหลังบ้าน) ไฟล์ที่ใช้ร่วมกัน (`router.jsx`, `index.css`, `src/shared/`, `src/data/`) เปลี่ยนบ่อยที่สุด จึงควรแก้ให้น้อย
- pull `main` บ่อย ๆ และทำ PR ให้เล็ก
- หลัง PR ถูก merge: `git checkout main && git pull` แล้วค่อยเริ่ม branch ใหม่

## แดชบอร์ดแอดมิน (A5)

`/admin` มี 3 ส่วนตามลำดับ: **ภาพรวมปี 2025** (ปีตัวอย่างที่จบแล้ว), **ไรเดอร์ · 30 วันล่าสุด** และ **ออเดอร์ล่าสุด** ภาพรวมแสดง KPI 4 ช่อง (ยอดขาย **177,321 บาท**, **946 ออเดอร์**, ยอดเฉลี่ยต่อออเดอร์ **187 บาท**, ลูกค้าใหม่ **295** คน) แต่ละช่องมี % ครึ่งปีหลังเทียบครึ่งปีแรกจาก `halfYearGrowth` ตามด้วยแผนที่จังหวัด กราฟยอดขายรายเดือน และ Top 5 ร้าน (แสดงเป็น % ของยอดขาย) ยอดรายเดือนรวมแล้วตรงกับตัวเลขสรุป รูปร้านใช้จากแคตตาล็อก จำนวนเมนู/ไรเดอร์ในแคตตาล็อก กราฟร้านอาหารและลูกค้าใหม่ และ Top 5 ลูกค้า ถูกเอาออกเมื่อ 20 พ.ย. 2026 เพื่อเหลือเฉพาะข้อมูลที่ผู้บริหารต้องใช้

สถานะไรเดอร์ตอนนี้ (พร้อมรับงาน / กำลังจัดส่ง / ออฟไลน์ โดยบัญชีที่ถูกระงับนับรวมอยู่แล้ว) คำนวณจาก `src/data/riders.js` และอยู่ในส่วนไรเดอร์ ออเดอร์ล่าสุดแสดง 5 รายการใหม่สุดจาก `useOrders()` รวมออเดอร์ที่ถูกยกเลิก สถานะอัปเดตด้วย `src/shared/hooks/useOrderClock.js` ที่ใช้ร่วมกัน ออเดอร์จาก checkout เดโมเหล่านี้แยกจากรายงานตัวอย่างประจำปีที่ตายตัว

กราฟรองรับ focus, ปุ่มลูกศร, Home/End, ตัวเลือกเดือนก่อน/ถัดไป และตารางที่กางออกดูค่าจริงได้ ที่ความกว้าง 360px KPI แสดง 2 คอลัมน์ ส่วนอื่นเรียงต่อกันแนวตั้ง ไม่ได้เพิ่ม chart library หรือ backend

## พื้นที่ให้บริการในอดีต และหน้ากระเป๋าเงิน/บัญชีของไรเดอร์

A5 แสดงแผนที่ SVG 77 จังหวัด (เก็บในเครื่อง มีระบุที่มา) ไฮไลต์ 19 จังหวัดที่ให้บริการตามข่าวประชาสัมพันธ์ช่วง **พ.ค.–พ.ย. 2565** (รวมชุมพร) และ 3 จังหวัดที่มีการใช้งานสูงสุด แยกจากรายงานตัวอย่างปี 2025 ตัวเลขสรุปจากข่าวถูกเอาออกใน #43 `coverage.js` เป็นเจ้าของชื่อจังหวัดและจับคู่ทุกจังหวัดกับ id ใน SVG ไม่ได้เพิ่ม dependency สำหรับแผนที่/กราฟ

R5 `/rider/wallet` แสดงยอดเครดิต/เงินสดที่คำนวณจาก ledger ของแต่ละกระเป๋า รายการถอนเงินสดที่รอดำเนินการ ประวัติพร้อมเครื่องหมาย +/− และช่องทางเติมเครดิต (แสดงข้อมูลอย่างเดียว) R6 `/rider/income` มีรายงานรายวัน/รายเดือนตามปฏิทินเวลากรุงเทพฯ แถบเลือกวันแบบเลื่อนได้ กราฟ/ตารางรายเดือนพร้อมค่าจริง KPI ของช่วงเวลา และประวัติงาน เดือนในอนาคตจะว่าง R7 `/rider/account` แสดงโปรไฟล์เดโมและการกระจายคะแนนที่ใช้ร่วมกัน สวิตช์ online/รับงานอัตโนมัติ และรายละเอียดแบบอ่านอย่างเดียวที่ `/rider/account/profile`, `/rider/account/banks`, `/rider/account/vehicle` หน้าแท็บทั้งสามใช้ `RiderTabHeader` ร่วมกัน (มีชื่อหน้า ไม่มีปุ่มย้อนกลับ เพราะใช้แท็บด้านล่างนำทาง) ใน R5 การ์ดยอดเงินทั้งสองใบเป็นแท็บสลับประวัติด้วย

`useRider()` จาก `@/state` ให้ snapshot กิจกรรม/ledger ชุดเดียวที่ใช้ร่วมกันใน R2/R5/R6/R7 หน้าแรก R2 ฉบับเต็มจาก #40 อ่านผ่าน `useRiderSummary` ส่วน R7 ใช้ store `useRiderStatus()` เดิมจาก R2 สำหรับสวิตช์ทั้งสองที่บันทึกไว้ Logout ของไรเดอร์ล้างเฉพาะ session ของไรเดอร์ `riderReports.js` จัดกลุ่มข้อมูลกิจกรรมที่มีอยู่โดยไม่ทำยอดรวมซ้ำ ออเดอร์ที่ไรเดอร์ส่งเสร็จจาก R3–R4 จะเข้าไปในรายได้วันนี้และ ledger เงินสดโดยตรงจาก snapshot ของออเดอร์ ครั้งเดียวต่อเลขออเดอร์ การส่งของลูกค้าที่เดินตามเวลาไม่นับรวม และไม่มีการบันทึกรายได้ซ้ำ

## สำรวจแผนที่ในหน้าแอดมิน และรายได้ไรเดอร์

แผนที่ใน A5 อยู่ต่อจาก KPI ภาพรวม hover/focus จะแสดง**จำนวนออเดอร์สมมติปี 2025** ของจังหวัดนั้น คลิก/Enter จะซูมและไฮไลต์จังหวัดพร้อม animation วงแหวนสั้น ๆ ส่วน Reset/Escape จะกลับมาแสดงทั้งประเทศไทย ยอดที่จัดสรรให้ 19 จังหวัดรวมกันเท่ากับ KPI เดโม 946 ออเดอร์ มีป้ายระบุชัดว่าเป็นข้อมูลสมมติ และแยกจากทั้งออเดอร์ checkout จริงและรายชื่อจังหวัดที่ให้บริการปี 2565 จังหวัดที่เป็นศูนย์หมายถึงไม่ได้จัดสรรในเดโมนี้ ไม่ได้แปลว่าไม่มีออเดอร์จริง ข้างแผนที่แสดงจังหวัดที่เลือกและอันดับจังหวัดที่มีออเดอร์มากที่สุด (6 อันดับ กางดูครบ 19 จังหวัดได้)

ต่อจากภาพรวมคือ **ไรเดอร์ · 30 วันล่าสุด** (#43, `RiderPerformance.jsx` + `RushHourChart.jsx`) ครอบคลุมไรเดอร์ทั้ง 17 คนในแคตตาล็อก ในช่วง 30 วันตามเวลากรุงเทพฯ เดียวกับแถบเลือกวันของ R6 ประกอบด้วยตัวเลขของทีม 4 ช่อง (งานที่ส่งสำเร็จ, เวลาส่งเฉลี่ยถ่วงน้ำหนักตามจำนวนงาน, อัตรารับงาน, คะแนนถ่วงน้ำหนักตามจำนวนงาน), สถานะไรเดอร์ตอนนี้, Top 5 ไรเดอร์ที่ active (งาน · คะแนน · อัตรารับงาน; ไรเดอร์ที่ถูก block ไม่ติดอันดับแต่ยังนับในตัวเลขรวม) และกราฟช่วงเวลาเร่งด่วนรายชั่วโมงของออเดอร์เทียบกับไรเดอร์ที่ online ต่อวัน ไฮไลต์ 2 ชั่วโมงที่ยุ่งที่สุดต่อไรเดอร์ พร้อมตารางค่าจริง EA00001 อ่านจากกิจกรรม `useRider()` ที่ใช้ร่วมกัน ตัวเลขจึงตรงกับ R6 ส่วนไรเดอร์อีก 16 คนเป็นข้อมูลสมมติที่สร้างแบบกำหนดแน่นอน (deterministic) แผนที่ไม่เล่น animation เมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว (reduced motion)
