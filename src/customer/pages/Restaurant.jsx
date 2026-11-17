import { useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Clock, Heart, MapPin, Phone, Store, TicketPercent } from 'lucide-react'
import { getRestaurant } from '@/data/restaurants'
import { getMenu } from '@/data/menus'
import Button from '@/shared/components/Button'
import Card from '@/shared/components/Card'
import TopBar from '@/shared/components/TopBar'
import { notInScope } from '@/shared/components/Toast'
import { formatBaht, formatDate } from '@/shared/lib/format'
import { useCart, useFavorites } from '@/state'
import { FeaturedMenuCard, MenuRow } from '@/customer/components/MenuCard'
import FloatingCartBar from '@/customer/components/FloatingCartBar'
import StarRating from '@/customer/components/StarRating'

const TABS = [
  { id: 'menu', label: 'เมนู' },
  { id: 'info', label: 'ข้อมูล' },
  { id: 'offers', label: 'ส่วนลด' },
  { id: 'reviews', label: 'รีวิว' },
]

const TOP_BAR_HEIGHT = 56 // TopBar is h-14; the tab bar sticks right under it

/**
 * C4 Restaurant detail. The menu tab works (every item opens C5); the other tabs are display only.
 * The selected tab lives in `?tab=` so Back from C5 returns to the same tab.
 * The floating cart bar (C6) sticks to the bottom when the cart has food.
 */
export default function Restaurant() {
  const { restaurantId } = useParams()
  const restaurant = getRestaurant(restaurantId)
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'menu'
  const tabsTop = useRef(null)

  // The phone's scroll container is shared by every screen: start each restaurant at the top.
  useEffect(() => {
    document.getElementById('phone-scroll')?.scrollTo({ top: 0 })
  }, [restaurantId])

  // Opened by a deep link → Back goes home instead of leaving the app.
  const backTo = window.history.state?.idx > 0 ? undefined : '/app'

  if (!restaurant) return <NotFound backTo={backTo} />

  const selectTab = (id) => {
    setParams(id === 'menu' ? {} : { tab: id }, { replace: true })
    // If the tab bar is stuck at the top, jump to the start of the new tab's content.
    const scroller = document.getElementById('phone-scroll')
    const marker = tabsTop.current
    if (!scroller || !marker) return
    const target =
      scroller.scrollTop +
      marker.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      TOP_BAR_HEIGHT
    if (scroller.scrollTop > target) scroller.scrollTo({ top: target })
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="ร้านอาหาร" backTo={backTo} />
      <Header restaurant={restaurant} />

      <div ref={tabsTop} />
      <div
        role="tablist"
        aria-label="ข้อมูลร้าน"
        className="sticky top-14 z-10 grid grid-cols-4 border-b border-neutral-200 bg-white"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="restaurant-tabpanel"
            onClick={() => selectTab(t.id)}
            className={`relative h-12 text-sm font-semibold transition-colors ${
              tab === t.id ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-brand" />}
          </button>
        ))}
      </div>

      <div id="restaurant-tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-col">
        {tab === 'menu' && <MenuTab restaurant={restaurant} />}
        {tab === 'info' && <InfoTab restaurant={restaurant} />}
        {tab === 'offers' && <OffersTab restaurant={restaurant} />}
        {tab === 'reviews' && <ReviewsTab restaurant={restaurant} />}
      </div>

      <div className="h-6" />
      <FloatingCartBar />
    </div>
  )
}

function Header({ restaurant: r }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const liked = isFavorite(r.id)

  return (
    <section>
      <img src={r.cover} alt="" className="aspect-[2/1] w-full bg-surface object-cover" />

      <div className="flex flex-col gap-1 px-4">
        <div className="flex items-end justify-between">
          <img
            src={r.image}
            alt=""
            className="-mt-10 size-20 rounded-2xl bg-surface object-cover shadow-md ring-4 ring-white"
          />
          <button
            type="button"
            aria-label={liked ? 'เลิกถูกใจร้านนี้' : 'ถูกใจร้านนี้'}
            aria-pressed={liked}
            onClick={() => toggleFavorite(r.id)}
            className="mt-3 grid size-10 place-items-center rounded-full ring-1 ring-neutral-200 hover:bg-neutral-100"
          >
            <Heart className={`size-5 ${liked ? 'fill-danger text-danger' : 'text-neutral-400'}`} />
          </button>
        </div>
        <h2 className="mt-2 text-xl leading-snug font-bold">{r.name}</h2>
        <p className="text-sm text-muted">{r.types.join(', ')}</p>
        <p className="flex flex-wrap items-center gap-x-1.5 text-sm">
          <StarRating value={r.rating} />
          <span className="font-semibold">{r.rating}/5</span>
          <span className="text-muted">({r.reviewCount} รีวิว)</span>
        </p>
      </div>

      <dl className="mx-4 mt-4 grid grid-cols-3 divide-x divide-neutral-200 rounded-2xl bg-surface py-3 text-center">
        <Stat value={formatBaht(r.minOrder)} label="ยอดขั้นต่ำ" />
        <Stat value={`${r.distanceKm} กม.`} label="ระยะทาง" />
        <Stat value={formatBaht(r.deliveryFee)} label="ค่าจัดส่ง" />
      </dl>

      {r.promo && (
        <p className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark">
          <TicketPercent className="size-4 shrink-0" />
          {r.promo}
        </p>
      )}
      <div className="h-4" />
    </section>
  )
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col-reverse gap-0.5 px-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-lg font-bold">{value}</dd>
    </div>
  )
}

/** menuId → quantity already in the cart (only counts this restaurant's cart). */
function useQtyByMenu(restaurantId) {
  const { restaurant, items } = useCart()
  return useMemo(() => {
    const qty = new Map()
    if (restaurant?.id !== restaurantId) return qty
    for (const item of items) qty.set(item.menuId, (qty.get(item.menuId) ?? 0) + item.qty)
    return qty
  }, [restaurant, items, restaurantId])
}

function MenuTab({ restaurant: r }) {
  const qtyByMenu = useQtyByMenu(r.id)
  const featured = r.featuredMenuIds.map(getMenu).filter(Boolean)

  return (
    <>
      {featured.length > 0 && (
        <section className="flex flex-col gap-3 pt-5 pb-5">
          <h3 className="px-4 text-lg font-bold">เมนูแนะนำ</h3>
          <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
            {featured.map((m) => (
              <FeaturedMenuCard key={m.id} menu={m} qty={qtyByMenu.get(m.id)} />
            ))}
          </div>
        </section>
      )}

      {r.menuSections.map((section) => (
        <section key={section.title} className="border-t-8 border-surface px-4 pt-4 pb-1">
          <h3 className="text-lg font-bold">{section.title}</h3>
          <ul className="divide-y divide-neutral-100">
            {section.menuIds
              .map(getMenu)
              .filter(Boolean)
              .map((m) => (
                <li key={m.id}>
                  <MenuRow menu={m} qty={qtyByMenu.get(m.id)} />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </>
  )
}

function InfoTab({ restaurant: r }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="flex flex-col gap-3 ring-1 ring-neutral-100">
        <h3 className="font-bold">ผู้ประกอบการ</h3>
        <InfoRow icon={Store}>{r.name}</InfoRow>
        <InfoRow icon={MapPin}>{r.address}</InfoRow>
        <InfoRow icon={Phone}>{r.phone}</InfoRow>
      </Card>
      <Card className="flex flex-col gap-3 ring-1 ring-neutral-100">
        <h3 className="font-bold">เวลาให้บริการ</h3>
        {r.hours.map((h) => (
          <InfoRow key={h.days} icon={Clock}>
            <span className="flex flex-wrap justify-between gap-x-4">
              <span>{h.days}</span>
              <span className="font-medium">{h.ranges.join(', ')}</span>
            </span>
          </InfoRow>
        ))}
      </Card>
    </div>
  )
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function OffersTab({ restaurant: r }) {
  if (!r.promo) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-surface">
          <TicketPercent className="size-8 text-muted" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-muted">ร้านนี้ยังไม่มีส่วนลด</p>
      </div>
    )
  }
  return (
    <div className="p-4">
      <div className="flex gap-3 rounded-2xl bg-brand-light p-4 ring-1 ring-brand/40">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand">
          <TicketPercent className="size-6" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold">{r.promo}</p>
          {r.offer?.maxDiscount && (
            <p className="text-sm text-muted">
              ลดสูงสุด {formatBaht(r.offer.maxDiscount)} · ระบบคิดส่วนลดในตะกร้าให้อัตโนมัติ
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewsTab({ restaurant: r }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
        <span className="text-4xl font-bold">{r.rating}</span>
        <div className="flex flex-1 flex-col gap-1">
          <StarRating value={r.rating} className="size-5" />
          <span className="text-sm text-muted">จาก {r.reviewCount} รีวิว</span>
        </div>
        <Button size="sm" variant="secondary" onClick={notInScope}>
          เขียนรีวิว
        </Button>
      </div>

      <ul className="flex flex-col divide-y divide-neutral-100">
        {r.reviews.map((review) => (
          <li key={`${review.name}-${review.date}`} className="flex gap-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-light font-semibold text-brand-dark">
              {review.name.charAt(0)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{review.name}</span>
                <span className="text-xs text-muted">{formatDate(review.date)}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <StarRating value={review.rating} className="size-3.5" />
                <span className="sr-only">{review.rating} ดาว</span>
              </span>
              <p className="text-sm">{review.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NotFound({ backTo }) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="ร้านอาหาร" backTo={backTo} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <span className="mb-2 grid size-28 place-items-center rounded-full bg-brand-light">
          <span className="grid size-18 place-items-center rounded-full bg-white shadow-sm">
            <Store className="size-9 text-brand-dark" strokeWidth={1.75} />
          </span>
        </span>
        <h2 className="text-lg font-semibold">ไม่พบร้านนี้</h2>
        <p className="text-sm text-muted">ร้านอาจปิดให้บริการแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <Button to="/app" className="mt-2">
          กลับหน้าแรก
        </Button>
      </div>
    </div>
  )
}
