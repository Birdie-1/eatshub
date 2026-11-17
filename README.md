# eatsHub Mockup

Mobile-first clickable mockup of the eatsHub food-delivery platform, deployed to Vercel.

## Run locally

Requires Node 20.19+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

Deploys to Vercel as a static Vite site (`vercel.json` rewrites all paths to `index.html` so deep links work).

## Project structure

```
brand/                  logo files (primary color #FCBB18), imported via @brand/...
docs/REQUIREMENTS.md    mockup scope, decisions, done criteria (source of truth)
docs/specs/             module specs summarized from the original PDFs
src/
  main.jsx, router.jsx  entry + all routes; screen IDs (C1–C12, A1–A3) match REQUIREMENTS.md
  index.css             Tailwind + design tokens (bg-brand, bg-admin, status colors, fonts)
  customer/             customer app
    layouts/            PhoneFrame (phone frame on desktop, full screen on phones),
                        TabLayout (bottom nav ร้านอาหาร · ตะกร้า · ออเดอร์ · บัญชี)
    pages/              C1–C12 screens
  admin/                back office
    layouts/            AdminLayout (header, sidebar with ☰ on mobile, footer), adminMenu.js
    pages/              A1 sign-in, A3 rider list
  shared/               used by both apps
    pages/Landing.jsx   choose customer app / back office
    components/         shared UI (Logo, ScreenStub placeholder, ...)
    lib/                helpers (formatBaht, pricing, ...)
    assets/images/      Unsplash food photos (stored in repo, never hotlinked)
  data/                 static mock data from the specs (see src/data/README.md)
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

Styling: use the tokens (`bg-brand`, `text-brand-dark`, `bg-admin`, `bg-status-online` …) rather than raw hex. Inside the phone frame, use `sticky`/`absolute` instead of `fixed` so bars stay inside the phone on desktop.

## Working together (2 people)

`main` is the deployable branch — don't push to it directly. Work on a branch and open a Pull Request.

```bash
# 1. Start from the latest main
git checkout main
git pull

# 2. Create a branch for your task
git checkout -b feature/restaurant-list

# 3. Commit and push your work
git add .
git commit -m "Add restaurant list screen"
git push -u origin feature/restaurant-list

# 4. Open a PR on GitHub, ask the other person to review, then merge
gh pr create --fill
```

Tips to avoid conflicts:
- Split work by screen/flow (e.g. one person on customer ordering, the other on the back-office rider list). Shared files (`router.jsx`, `index.css`, `src/shared/`, `src/data/`) change most often, so keep edits there small.
- Pull `main` often and keep PRs small.
- After a PR is merged: `git checkout main && git pull`, then start a new branch.
