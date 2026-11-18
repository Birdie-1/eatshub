# CLAUDE.md

Guidance for Claude Code when working in this repository. For setup, routes and the full component/state API, read [README.md](README.md); for scope and decisions, read [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md). This file only covers the standards and practices to follow — don't duplicate those docs here.

## What this project is

A mobile-first, clickable **mockup** of the defunct eatsHub food-delivery platform, shown to executives and deployed to Vercel as a static site. There is **no backend**: all data is mock data from the specs, and state lives in React Context + `localStorage`.

Stack: React 19, React Router 7, Vite, Tailwind CSS 4, Vitest. Plain JavaScript (JSX) — no TypeScript.

## Commands

```bash
npm run dev            # http://localhost:5173
npm run lint           # ESLint
npm run format         # Prettier (write)
npm run format:check   # Prettier (check only)
npm test               # Vitest, single run
npm run build          # production build into dist/
```

Before declaring work done or opening a PR, all of these must pass: `npm run lint && npm run format:check && npm test && npm run build`.

## Source of truth

- **Scope** → `docs/REQUIREMENTS.md`. If a change alters scope (new screen, new flow, something moving in/out of scope), update that doc in the same PR. Screen IDs (C1–C12, A1–A5) are used in `router.jsx` and docs — keep them consistent.
- **Original product behaviour** → `docs/specs/*.md` (summaries of the original PDFs). Deliberate deviations from the specs are listed in REQUIREMENTS §6; add to that table when you fix a spec inconsistency.
- **Mock data shapes** → the header comment of each file in `src/data/`, plus `src/data/README.md`.
- When behaviour or structure changes, update README (and `src/data/README.md` for data files) so they stay accurate.

## Code standards

**Formatting** is owned by Prettier (`.prettierrc.json`: no semicolons, single quotes, 110 columns, trailing commas). Don't hand-format or argue with it — run `npm run format`. `.md` files are excluded from Prettier.

**Linting**: ESLint flat config with `react-hooks` and `react-refresh`. Fix warnings rather than disabling rules. Unused variables must be removed (names starting with `_` or an uppercase letter are exempt). The only `react-refresh/only-export-components` exemption is `src/state/**` and `Toast.jsx` — don't add new ones casually.

**Imports**: use the aliases `@/…` (→ `src/`) and `@brand/…` (→ `brand/`), not long relative paths. Same-folder siblings may use `./`.

**Components**: function components + hooks, one component per file, `PascalCase.jsx`. Non-component modules are `camelCase.js`. Hooks are named `useX`.

**Folder boundaries** — keep the dependency direction one-way:
- `src/customer/` and `src/admin/` may import from `src/shared/`, `src/state/`, `src/data/`; avoid importing from each other. Code both apps need belongs in `shared/` or `state/`. (Known exception: `admin/pages/Dashboard.jsx` imports `useOrderClock` from `customer/` — move that hook to `shared/` or `state/` if you touch it.)
- `src/shared/` must not import from `customer/` or `admin/`.
- Put a component in `shared/components/` only when both apps (or 2+ screens) use it; otherwise keep it next to its screen.
- Reuse the shared building blocks (`Button`, `Card`, `Badge`, `TopBar`, `BottomSheet`, `ConfirmDialog`, `toast`) before writing new ones.

**Keep it simple**: this is a mockup. Don't add abstractions, config layers, or dependencies the current screens don't need. New npm dependencies need a clear reason — mention it in the PR.

## Styling

- Use the design tokens in `src/index.css` (`brand`, `ink`, `muted`, `surface`, `success`, `danger`, …). **Never write raw hex** in components. The brand primary is `#FCBB18`; it is defined once as a token.
- Shapes: cards `rounded-2xl`, buttons `rounded-xl`. Fonts are already set via `font-sans` (Montserrat + IBM Plex Sans Thai) — don't override.
- Inside the customer phone frame, use `sticky`/`absolute`, **not `fixed`**, so bars and sheets stay inside the phone on desktop.
- Mobile-first: design for ≥ 360px wide first, then scale up. The back office is full-width: cards below 1024px, table above.
- Accessibility basics: real `<button>`/`<a>` elements for interactions, labels on inputs, `aria-label` on icon-only buttons, visible focus, and Escape/backdrop dismissal plus focus handling on dialogs and drawers.

## UI text and language

- **All user-facing text is Thai only** (no i18n layer). Keep terminology consistent with the specs and existing screens.
- Code, identifiers, comments, and `README`/`CLAUDE.md` are in English. `docs/REQUIREMENTS.md`, `QA.md` and `DEMO.md` are Thai.
- Don't render buttons, links or menu items for features that are out of scope — hide them instead of shipping dead controls (no "not in scope" toasts). Static display text is fine.

## State, money and data rules

- **Money is computed in one place**: `calcTotals` in `src/state/cart.js`. Screens read `totals` — never recompute food, delivery, discount or total amounts in a component. The same number must appear on Cart, Checkout, the floating cart bar, and the order summary.
- Format with `formatBaht` (lists) / `formatAmount` (summaries) from `@/shared/lib/format`.
- Orders **freeze a snapshot** (items, notes, address, totals, rider) at creation time; later changes to the cart or mock data must not alter existing orders.
- Persist through the helpers in `src/state/storage.js` (keys are prefixed `eatshub:`, every access is try/catch'd). Don't call `localStorage` directly; the app must still work when storage is blocked or corrupt.
- Mock data stays static and in `src/data/`. Build sample records from real restaurant/menu data rather than duplicating values. If you add or change data, keep the invariants asserted in its `*.test.js` (e.g. dashboard series sum to the headline totals; rider codes `EA00001`–`EA00017`).
- Auth is a **demo**: `useSession` only flips a flag. Never add real credential handling, and never collect real payment or personal data — COD, PromptPay QR and PayPal are simulations.

## Testing

- Vitest, with test files **next to the code** as `*.test.js` / `*.test.jsx`. Run the whole suite with `npm test`; use `npm run test:watch` while developing.
- Test logic, not markup: money rules, reducers, state providers, data invariants, formatting, ID sequences and time-based status transitions have tests today — follow that pattern. Provider tests use `renderToString` with a stubbed `localStorage` (see `OrdersProvider.test.jsx`).
- Any change to `src/state/` or `src/data/` behaviour comes with a test change. Fix bugs test-first where practical: write the failing test, then the fix.
- Use `src/state/fixtures.js` for the spec's sample cart in tests only — shipped screens must read the live cart.
- UI flows are checked manually in the browser (see `docs/QA.md` for what has been covered). For a UI change, run `npm run dev` and actually exercise the screen at a phone width (≥ 360px) and on desktop, including the empty / refresh / signed-out cases. Passing lint and unit tests doesn't prove a screen works.

## Images and assets

- Images are **stored in the repo** (`src/shared/assets/images/`), never hotlinked. Record the source/credit in `src/shared/assets/images/CREDITS.md`; category icons carry their own license file.
- Food photos should match the dish name. If the user supplies photos, swap them in by filename rather than searching for new stock photos.
- Logos come from `brand/` (`logo.svg`, `logo-transparent.svg`) via `@brand/…`.

## Git and PR workflow

Two-person team. `main` is the deployable branch and is **convention-protected only** (the free private repo has no branch protection), so never push to it directly.

1. Branch from an up-to-date `main`: `feature/<issue-number>-<short-name>` (e.g. `feature/3-home`).
2. Commit small, focused changes. Messages are short and imperative; Thai or English both appear in the history. Reference the screen ID where relevant (e.g. `C4: …`).
3. Run the full check (`lint`, `format:check`, `test`, `build`) before pushing.
4. Open a PR with `Closes #<issue>`, ask the other person to review, and **squash merge** (the only merge method used).
5. After merge: `git checkout main && git pull`, then start the next branch.

Don't commit `dist/`, `node_modules/`, `.env*`, or `.claude/settings.local.json` (all already gitignored). Never commit secrets.

To reduce merge conflicts: split work by screen/flow, keep edits to the frequently-touched shared files (`router.jsx`, `index.css`, `src/shared/`, `src/data/`) small, and pull `main` often.

## Deployment

Vercel static Vite site (`vercel.json` rewrites every path to `index.html` so deep links work). Production is live at **https://eatshub-red.vercel.app** (Vercel team `birdie-1s-projects`, project `eatshub`).

The project is linked to this GitHub repo: **every merge to `main` deploys production automatically**, and each PR gets its own preview URL (deployment-specific URLs are behind Vercel login; the production domain is public). So merging to `main` ships straight to the URL executives see — run the full check first. Don't change Vercel project settings, domains or deployment protection unless the user asks.

## Working agreements for Claude

- Read the relevant doc/spec and the neighbouring code before changing a screen; match the existing patterns instead of introducing new ones.
- Don't start building features on a brief that's still arriving in pieces — confirm scope with the user first (scope lives in REQUIREMENTS.md).
- Stay within what was asked. If you notice an unrelated problem, mention it instead of fixing it in the same change.
- Don't commit, push, open PRs, or deploy unless the user asks.
- Report results honestly: if lint/tests/build fail or something wasn't verified in the browser, say so.
