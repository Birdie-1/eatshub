import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronDown, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { banners, restaurants } from '@/data/restaurants'
import { useAddress } from '@/state'
import AddressSheet from '@/customer/components/AddressSheet'
import BannerCarousel from '@/customer/components/BannerCarousel'
import CategoryGrid from '@/customer/components/CategoryGrid'
import RestaurantCard from '@/customer/components/RestaurantCard'
import RestaurantFilterSheet from '@/customer/components/RestaurantFilterSheet'

/** C2 Home: address header, banner carousel, category grid, nearby restaurants. */
export default function Home() {
  const navigate = useNavigate()
  const { address } = useAddress()
  const [sheet, setSheet] = useState(null) // 'address' | 'filter' | null

  return (
    <div className="flex flex-col gap-5 pb-24">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-neutral-100 bg-white/95 px-4 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={() => setSheet('address')}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 text-left"
        >
          <MapPin className="size-6 shrink-0 fill-brand text-brand-dark" />
          <span className="min-w-0">
            <span className="flex items-center gap-0.5 font-bold">
              {address.label}
              <ChevronDown className="size-4" />
            </span>
            <span className="block truncate text-xs text-muted">{address.detail}</span>
          </span>
        </button>
        <Link
          to="/app/search"
          aria-label="ค้นหาร้านอาหาร"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-surface hover:bg-neutral-200"
        >
          <Search className="size-5" />
        </Link>
        <button
          type="button"
          aria-label="ตัวกรอง"
          onClick={() => setSheet('filter')}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-surface hover:bg-neutral-200"
        >
          <SlidersHorizontal className="size-5" />
        </button>
      </header>

      <BannerCarousel slides={banners} />

      <CategoryGrid />

      <section className="flex flex-col gap-3 border-t-8 border-surface px-4 pt-5">
        <h2 className="text-lg font-bold">ร้านอาหารใกล้เคียง</h2>
        <ul className="flex flex-col gap-3">
          {restaurants.map((r) => (
            <li key={r.id}>
              <RestaurantCard restaurant={r} />
            </li>
          ))}
        </ul>
      </section>

      <AddressSheet open={sheet === 'address'} onClose={() => setSheet(null)} />
      <RestaurantFilterSheet
        key={sheet === 'filter' ? 'filter-open' : 'filter-closed'}
        open={sheet === 'filter'}
        onClose={() => setSheet(null)}
        value={null}
        onApply={(type) => navigate(type ? `/app/search?type=${encodeURIComponent(type)}` : '/app/search')}
      />
    </div>
  )
}
