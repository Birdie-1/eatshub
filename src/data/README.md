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
