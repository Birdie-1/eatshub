import { useState } from 'react'
import { Bike, Store } from 'lucide-react'
import BottomSheet from '@/shared/components/BottomSheet'
import Button from '@/shared/components/Button'
import StarInput from '@/customer/components/StarInput'

const REVIEW_MAX = 200

/**
 * C10 review modal (Grab/LINE MAN style): rider stars are required; restaurant stars and the
 * review are optional and can be skipped.
 */
export default function RatingSheet({ open, order, onClose, onSubmit }) {
  const [rider, setRider] = useState(0)
  const [restaurant, setRestaurant] = useState(0)
  const [review, setReview] = useState('')
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="ให้คะแนน"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" className="border border-neutral-200" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            disabled={!rider}
            onClick={() => onSubmit({ rider, restaurant: restaurant || null, review })}
          >
            ให้คะแนน
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-neutral-100 p-4">
          <h3 className="text-sm font-semibold">
            ให้คะแนนไรเดอร์{' '}
            <span aria-hidden className="font-normal text-danger">
              *
            </span>
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-dark">
              <Bike className="size-6" />
            </span>
            <p className="text-sm">{order.rider?.name}</p>
          </div>
          <div className="mt-3">
            <StarInput label="คะแนนไรเดอร์" value={rider} onChange={setRider} />
          </div>
        </section>
        <section className="rounded-2xl border border-neutral-100 p-4">
          <h3 className="text-sm font-semibold">
            ให้คะแนนร้านค้า <span className="font-normal text-neutral-400">(ไม่บังคับ)</span>
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-dark">
              <Store className="size-6" />
            </span>
            <p className="text-sm">{order.restaurant.name}</p>
          </div>
          <div className="mt-3">
            <StarInput label="คะแนนร้านค้า" value={restaurant} onChange={setRestaurant} />
          </div>
          <label htmlFor="review" className="mt-4 block text-xs text-neutral-500">
            เขียนรีวิวร้านค้า (ไม่บังคับ)
          </label>
          <textarea
            id="review"
            rows={3}
            maxLength={REVIEW_MAX}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="เล่าให้ร้านฟังหน่อยว่ามื้อนี้เป็นอย่างไร"
            className="mt-2 w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-brand"
          />
          <p className="text-right text-[11px] text-neutral-400">
            {review.length}/{REVIEW_MAX}
          </p>
        </section>
      </div>
    </BottomSheet>
  )
}
