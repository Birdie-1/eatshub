import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Check, ChevronLeft, ChevronRight, Minus, Plus, UtensilsCrossed, X } from 'lucide-react'
import { getRestaurant, toCartRestaurant } from '@/data/restaurants'
import { getMenu } from '@/data/menus'
import Badge from '@/shared/components/Badge'
import BottomSheet from '@/shared/components/BottomSheet'
import Button from '@/shared/components/Button'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import TopBar from '@/shared/components/TopBar'
import { toast } from '@/shared/components/Toast'
import { formatBaht } from '@/shared/lib/format'
import { makeCartItem, useCart } from '@/state'

const MIN_QTY = 1
const MAX_QTY = 20

/** Extra price next to a choice: "0 ฿" when free, "+15 ฿" otherwise. */
const extra = (price) => (price ? `+${formatBaht(price)}` : formatBaht(0))

/**
 * C5 Menu item: pick an option (radio), add-ons (bottom sheet per group), note and quantity,
 * then add to the cart. The price on the button is `makeCartItem(...).lineTotal`, the same
 * number the cart will show. After adding, goes back to the restaurant (C4).
 */
export default function MenuItem() {
  const { restaurantId, menuId } = useParams()
  const restaurant = getRestaurant(restaurantId)
  const menu = getMenu(menuId)

  // The phone's scroll container is shared by every screen: start each menu at the top.
  useEffect(() => {
    document.getElementById('phone-scroll')?.scrollTo({ top: 0 })
  }, [menuId])

  if (!restaurant || !menu || menu.restaurantId !== restaurant.id) return <NotFound restaurant={restaurant} />

  // Keyed so choices reset when moving to another menu item.
  return <MenuDetail key={menu.id} restaurant={restaurant} menu={menu} />
}

function MenuDetail({ restaurant, menu }) {
  const navigate = useNavigate()
  const cart = useCart()

  const [optionIndex, setOptionIndex] = useState(0)
  const [picked, setPicked] = useState(() => menu.addonGroups.map(() => [])) // add-on names per group
  const [note, setNote] = useState('')
  const [qty, setQty] = useState(MIN_QTY)
  const [sheetGroup, setSheetGroup] = useState(null) // index of the group whose sheet is open
  const [askClear, setAskClear] = useState(false)

  const option = menu.options[optionIndex] ?? null
  const addons = menu.addonGroups.flatMap((group, gi) =>
    group.items
      .filter((a) => picked[gi].includes(a.name))
      .map((a) => ({ group: group.name, name: a.name, price: a.price })),
  )
  const item = makeCartItem({ restaurantId: restaurant.id, menu, option, addons, note, qty })
  const missing = menu.addonGroups.find((group, gi) => picked[gi].length < group.min)

  // Back to C4 (same tab it was on); opened by a deep link → replace with the restaurant page.
  const leave = () =>
    window.history.state?.idx > 0
      ? navigate(-1)
      : navigate(`/app/restaurant/${restaurant.id}`, { replace: true })

  const added = () => {
    toast('เพิ่มลงตะกร้าแล้ว')
    leave()
  }

  const addToCart = () => {
    const result = cart.add(item, toCartRestaurant(restaurant))
    if (result.ok) added()
    else setAskClear(true) // 'different-restaurant': the cart holds one store at a time
  }

  const clearAndAdd = () => {
    cart.add(item, toCartRestaurant(restaurant), { replace: true })
    setAskClear(false)
    added()
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Zero-height sticky row: the buttons float over the photo and stay reachable while scrolling */}
      <div className="sticky top-0 z-20 h-0">
        <div className="flex justify-between p-3">
          <FloatingIconButton label="ย้อนกลับ" onClick={leave}>
            <ChevronLeft className="size-6" />
          </FloatingIconButton>
          <FloatingIconButton label="ปิด" onClick={leave}>
            <X className="size-5" />
          </FloatingIconButton>
        </div>
      </div>

      <img src={menu.image} alt="" className="aspect-[4/3] w-full bg-surface object-cover" />

      <div className="relative -mt-5 flex flex-col rounded-t-3xl bg-white">
        <section className="flex flex-col gap-1 px-4 pt-5 pb-4">
          <h1 className="text-xl leading-snug font-bold">{menu.name}</h1>
          {menu.description && <p className="text-sm text-muted">{menu.description}</p>}
          <p className="mt-1 text-lg font-bold">
            {formatBaht(menu.price)}
            <span className="ml-1.5 text-sm font-normal text-muted">ราคาเริ่มต้น</span>
          </p>
        </section>

        {menu.options.length > 0 && (
          <Section title="ตัวเลือก" aside={<Badge>เลือก 1</Badge>}>
            <div role="radiogroup" aria-label="ตัวเลือก" className="flex flex-col divide-y divide-neutral-100">
              {menu.options.map((o, i) => (
                <label key={o.label} className="flex cursor-pointer items-center gap-3 py-3">
                  <input
                    type="radio"
                    name="option"
                    checked={optionIndex === i}
                    onChange={() => setOptionIndex(i)}
                    className="size-5 shrink-0 accent-brand-dark"
                  />
                  <span className="flex-1">{o.label}</span>
                  <span className="text-sm text-muted">{extra(o.price)}</span>
                </label>
              ))}
            </div>
          </Section>
        )}

        {menu.addonGroups.length > 0 && (
          <Section title="ส่วนเสริม">
            <ul className="flex flex-col divide-y divide-neutral-100">
              {menu.addonGroups.map((group, gi) => (
                <li key={group.name}>
                  <AddonGroupRow group={group} picked={picked[gi]} onOpen={() => setSheetGroup(gi)} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="หมายเหตุถึงร้าน" aside={<span className="text-sm text-muted">ไม่บังคับ</span>}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={100}
            placeholder="เช่น ไม่ใส่ผัก"
            aria-label="หมายเหตุถึงร้าน"
            className="mt-1 mb-3 w-full resize-none rounded-xl bg-surface px-3 py-2.5 text-base outline-none placeholder:text-muted focus:ring-2 focus:ring-brand"
          />
        </Section>

        <div className="flex items-center justify-center gap-6 border-t-8 border-surface py-5">
          <StepperButton label="ลดจำนวน" disabled={qty <= MIN_QTY} onClick={() => setQty((n) => n - 1)}>
            <Minus className="size-5" />
          </StepperButton>
          <span className="w-8 text-center text-xl font-bold tabular-nums" aria-live="polite">
            <span className="sr-only">จำนวน </span>
            {qty}
          </span>
          <StepperButton label="เพิ่มจำนวน" disabled={qty >= MAX_QTY} onClick={() => setQty((n) => n + 1)}>
            <Plus className="size-5" />
          </StepperButton>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-auto flex flex-col gap-2 border-t border-neutral-100 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {missing && (
          <p className="text-center text-xs text-danger">
            กรุณาเลือก “{missing.name}” อย่างน้อย {missing.min} รายการ
          </p>
        )}
        <Button block size="lg" disabled={Boolean(missing)} onClick={addToCart}>
          เพิ่มในตะกร้า · {formatBaht(item.lineTotal)}
        </Button>
      </div>

      {sheetGroup !== null && (
        <AddonSheet
          group={menu.addonGroups[sheetGroup]}
          value={picked[sheetGroup]}
          onClose={() => setSheetGroup(null)}
          onConfirm={(names) => {
            setPicked((all) => all.map((p, gi) => (gi === sheetGroup ? names : p)))
            setSheetGroup(null)
          }}
        />
      )}

      <ConfirmDialog
        open={askClear}
        title="เริ่มตะกร้าใหม่?"
        confirmLabel="ล้างตะกร้า"
        onConfirm={clearAndAdd}
        onCancel={() => setAskClear(false)}
      >
        ตะกร้ามีอาหารจากร้าน {cart.restaurant?.name} อยู่ ต้องการล้างตะกร้าแล้วเริ่มใหม่ไหม?
      </ConfirmDialog>
    </div>
  )
}

function Section({ title, aside, children }) {
  return (
    <section className="flex flex-col border-t-8 border-surface px-4 pt-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** "ตัวเลือกเพิ่มวัตถุดิบ ›" with the picked add-ons in grey underneath. */
function AddonGroupRow({ group, picked, onOpen }) {
  const required = group.min >= 1 && picked.length < group.min
  const hint = group.min >= 1 ? `เลือกอย่างน้อย ${group.min}` : `ไม่บังคับ · เลือกได้สูงสุด ${group.max}`

  return (
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 py-3 text-left">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2 font-medium">
          {group.name}
          {required && <Badge tone="danger">จำเป็น</Badge>}
        </span>
        <span className="truncate text-sm text-muted">{picked.length ? picked.join(', ') : hint}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted" />
    </button>
  )
}

/** Checkbox list for one add-on group. Changes apply only on ยืนยัน; ยกเลิก / ✕ discards them. */
function AddonSheet({ group, value, onConfirm, onClose }) {
  const [draft, setDraft] = useState(value)
  const full = draft.length >= group.max

  const toggle = (name) =>
    setDraft((d) => (d.includes(name) ? d.filter((n) => n !== name) : full ? d : [...d, name]))

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={group.name}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button disabled={draft.length < group.min} onClick={() => onConfirm(draft)}>
            ยืนยัน
          </Button>
        </div>
      }
    >
      <p className="flex justify-between text-sm text-muted">
        <span>
          เลือกน้อยสุด: {group.min} มากสุด: {group.max}
        </span>
        <span aria-live="polite">
          เลือกแล้ว {draft.length}/{group.max}
        </span>
      </p>
      <ul className="mt-2 flex flex-col divide-y divide-neutral-100">
        {group.items.map((a) => {
          const checked = draft.includes(a.name)
          const disabled = full && !checked
          return (
            <li key={a.name}>
              <label
                className={`flex items-center gap-3 py-3 ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(a.name)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-items-center rounded-md border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${
                    checked ? 'border-brand-dark bg-brand-dark text-white' : 'border-neutral-300'
                  }`}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="flex-1">{a.name}</span>
                <span className="text-sm text-muted">{extra(a.price)}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}

function FloatingIconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full bg-white/90 shadow backdrop-blur hover:bg-white"
    >
      {children}
    </button>
  )
}

function StepperButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full border border-brand-dark text-brand-dark transition-colors hover:bg-brand-light disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function NotFound({ restaurant }) {
  const back = restaurant ? `/app/restaurant/${restaurant.id}` : '/app'
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="รายละเอียดเมนู" backTo={back} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <span className="mb-2 grid size-28 place-items-center rounded-full bg-brand-light">
          <span className="grid size-18 place-items-center rounded-full bg-white shadow-sm">
            <UtensilsCrossed className="size-9 text-brand-dark" strokeWidth={1.75} />
          </span>
        </span>
        <h2 className="text-lg font-semibold">ไม่พบเมนูนี้</h2>
        <p className="text-sm text-muted">เมนูอาจถูกนำออกแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <Button to={back} className="mt-2">
          {restaurant ? 'กลับไปหน้าร้าน' : 'กลับหน้าแรก'}
        </Button>
      </div>
    </div>
  )
}
