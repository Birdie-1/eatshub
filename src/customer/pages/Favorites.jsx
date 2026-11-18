import { useEffect } from 'react'
import { Heart } from 'lucide-react'
import { restaurants } from '@/data/restaurants'
import { useFavorites } from '@/state'
import TopBar from '@/shared/components/TopBar'
import Button from '@/shared/components/Button'
import RestaurantCard from '@/customer/components/RestaurantCard'

/**
 * C12 sub-page "ร้านค้าที่ถูกใจ": restaurants the customer ♥'d on Home / Search / C4.
 * Reads the same favorites store, so un-liking here removes the row immediately.
 */
export default function Favorites() {
  const { favorites } = useFavorites()
  const liked = restaurants.filter((r) => favorites.includes(r.id))

  // The phone's scroll container is shared by every screen; Account may be scrolled down.
  useEffect(() => {
    document.getElementById('phone-scroll')?.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="min-h-full bg-surface">
      <TopBar title="ร้านค้าที่ถูกใจ" backTo="/app/account" />
      {liked.length ? (
        <div className="space-y-3 p-4">
          <p className="text-xs text-muted">ร้านที่ถูกใจ {liked.length} ร้าน</p>
          {liked.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} showFavorite />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-light text-brand-dark">
            <Heart className="size-8" />
          </span>
          <h2 className="font-semibold">ยังไม่มีร้านที่ถูกใจ</h2>
          <p className="text-sm text-muted">แตะ ♥ ที่ร้านอาหารเพื่อเก็บไว้ดูภายหลัง</p>
          <Button to="/app" className="mt-2">
            ไปเลือกร้านอาหาร
          </Button>
        </div>
      )}
    </div>
  )
}
