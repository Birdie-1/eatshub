import { useState } from 'react'
import BottomSheet from '@/shared/components/BottomSheet'
import Button from '@/shared/components/Button'
import { restaurantTypes } from '@/data/restaurants'

const ALL = ''

/**
 * "ตัวกรอง" sheet (C2/C3): restaurant types as radios + "ค้นหา".
 * `value` = current type ('' / null = all); `onApply(type | null)` runs when ค้นหา is pressed.
 * Mount it with a `key` that changes when it opens so the draft resets to `value`.
 */
export default function RestaurantFilterSheet({ open, onClose, value, onApply }) {
  const [draft, setDraft] = useState(value ?? ALL)

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="ตัวกรอง"
      footer={
        <Button block size="lg" onClick={() => onApply(draft || null)}>
          ค้นหา
        </Button>
      }
    >
      <p className="pb-1 text-sm font-medium text-muted">ประเภทร้าน</p>
      <ul className="divide-y divide-neutral-100">
        {[ALL, ...restaurantTypes].map((t) => (
          <li key={t || 'all'}>
            <label className="flex cursor-pointer items-center justify-between py-3">
              <span>{t || 'ทั้งหมด'}</span>
              <input
                type="radio"
                name="restaurant-type"
                value={t}
                checked={draft === t}
                onChange={() => setDraft(t)}
                className="size-5 accent-brand-dark"
              />
            </label>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
