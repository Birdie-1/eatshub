import { useState } from 'react'
import { Link } from 'react-router'
import { Minus, Plus, ShoppingBag, Store, Ticket, Trash2, X } from 'lucide-react'
import { useCart, formatChoices } from '@/state'
import { coupons, findCoupon } from '@/data/coupons'
import Button from '@/shared/components/Button'
import Card from '@/shared/components/Card'
import TopBar from '@/shared/components/TopBar'
import BottomSheet from '@/shared/components/BottomSheet'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import PriceBreakdown from '@/customer/components/PriceBreakdown'
import { formatAmount, formatBaht } from '@/shared/lib/format'

export default function Cart() {
  const cart = useCart()
  const [couponOpen, setCouponOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState(null)
  const apply = (value) => {
    const result = cart.applyCoupon(value.trim().toUpperCase())
    if (result.ok) {
      setError('')
      setCode('')
      setCouponOpen(false)
    } else setError(result.error)
  }
  const appliedCoupon = findCoupon(cart.coupon)
  if (!cart.items.length)
    return (
      <div className="flex min-h-full flex-col">
        <TopBar title="ตะกร้าสินค้า" backTo="/app" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <span className="grid size-24 place-items-center rounded-full bg-brand-light text-brand-dark">
            <ShoppingBag className="size-10" />
          </span>
          <h2 className="text-xl font-semibold">ยังไม่มีอาหารในตะกร้า</h2>
          <p className="text-sm text-neutral-500">เลือกมื้ออร่อยจากร้านใกล้คุณได้เลย</p>
          <Button to="/app">เลือกร้านอาหาร</Button>
        </div>
      </div>
    )
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar title="ตะกร้าสินค้า" backTo="/app" />
      <div className="flex-1 space-y-4 p-4">
        <Card className="space-y-4 shadow-none">
          <div className="flex items-center gap-3">
            {cart.restaurant.image ? (
              <img src={cart.restaurant.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-dark">
                <Store className="size-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold">{cart.restaurant.name}</h1>
              <p className="mt-0.5 truncate text-xs text-neutral-500">{cart.restaurant.address}</p>
            </div>
            <Link
              to={`/app/restaurant/${cart.restaurant.id}`}
              className="shrink-0 py-2 text-xs text-brand-dark"
            >
              + เพิ่มเมนู
            </Link>
          </div>
          <ul className="divide-y divide-neutral-100">
            {cart.items.map((item) => (
              <li key={item.key} className="py-4">
                <div className="flex items-start gap-3">
                  {item.image && <img src={item.image} alt="" className="size-16 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold">
                      {item.name}{' '}
                      <span className="font-normal text-neutral-500">({formatBaht(item.basePrice)})</span>
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">{formatChoices(item)}</p>
                    {item.note && <p className="text-xs text-neutral-500">{item.note}</p>}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-xl border border-neutral-200">
                    <button
                      aria-label={`ลดจำนวน ${item.name}`}
                      onClick={() =>
                        item.qty === 1 ? setRemoving(item) : cart.updateQty(item.key, item.qty - 1)
                      }
                      className="grid size-11 place-items-center"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-7 text-center text-sm">{item.qty}</span>
                    <button
                      aria-label={`เพิ่มจำนวน ${item.name}`}
                      onClick={() => cart.updateQty(item.key, item.qty + 1)}
                      className="grid size-11 place-items-center"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{formatAmount(item.lineTotal)} ฿</p>
                  <button
                    aria-label={`ลบ ${item.name}`}
                    onClick={() => setRemoving(item)}
                    className="grid size-11 place-items-center text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-4 shadow-none">
          {[
            ['noteToStore', 'หมายเหตุถึงร้านค้า'],
            ['noteToRider', 'หมายเหตุถึงไรเดอร์'],
          ].map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className="mb-2 block text-sm font-medium">
                {label}
              </label>
              <textarea
                id={key}
                rows={2}
                value={cart[key]}
                onChange={(event) => cart.setNotes({ [key]: event.target.value })}
                className="admin-input py-3"
                placeholder="ระบุเพิ่มเติม (ไม่บังคับ)"
              />
            </div>
          ))}
        </Card>
        <Card className="shadow-none">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setError('')
                setCouponOpen(true)
              }}
              className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left text-sm"
            >
              <Ticket className="size-5 shrink-0 text-brand-dark" />
              {appliedCoupon ? (
                <span className="min-w-0">
                  <span className="block font-semibold">{appliedCoupon.code}</span>
                  <span className="block truncate text-xs text-neutral-500">{appliedCoupon.label}</span>
                </span>
              ) : (
                'ใส่รหัสส่วนลด / ใช้คูปอง ›'
              )}
            </button>
            {cart.coupon && (
              <button
                aria-label="เอาคูปองออก"
                onClick={cart.removeCoupon}
                className="grid size-11 place-items-center"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          {cart.coupon && !cart.totals.couponApplies && (
            <p className="text-xs text-danger">ยอดอาหารต่ำกว่าเงื่อนไข คูปองยังไม่ถูกนำมาคิดส่วนลด</p>
          )}
        </Card>
        <Card className="space-y-4 shadow-none">
          <h2 className="font-semibold">รายละเอียดราคา</h2>
          <PriceBreakdown totals={cart.totals} restaurant={cart.restaurant} coupon={cart.coupon} />
        </Card>
      </div>
      <div className="customer-action-bar bottom-[calc(4rem+env(safe-area-inset-bottom))]">
        {!cart.totals.meetsMinOrder && (
          <p className="mb-2 text-center text-sm text-warning">
            สั่งขั้นต่ำ {formatBaht(cart.totals.minOrder)} (ขาดอีก{' '}
            {formatBaht(cart.totals.minOrder - cart.totals.food)})
          </p>
        )}
        <Button
          size="lg"
          block
          to={cart.totals.meetsMinOrder ? '/app/checkout' : undefined}
          disabled={!cart.totals.meetsMinOrder}
        >
          ชำระเงิน · {formatAmount(cart.totals.total)} ฿
        </Button>
      </div>
      <BottomSheet open={couponOpen} onClose={() => setCouponOpen(false)} title="ใช้คูปองส่วนลด">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            apply(code)
          }}
          className="flex gap-2"
        >
          <label htmlFor="coupon-code" className="sr-only">
            รหัสคูปอง
          </label>
          <input
            id="coupon-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="ใส่รหัสส่วนลด"
            className="admin-input min-w-0 uppercase"
          />
          <Button type="submit" disabled={!code.trim()}>
            ใช้
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mt-4 space-y-3">
          {coupons.map((coupon) => (
            <button
              key={coupon.code}
              onClick={() => apply(coupon.code)}
              className={`w-full rounded-xl border border-dashed p-4 text-left ${cart.totals.food >= coupon.minFood ? 'border-brand bg-brand-light/40' : 'border-neutral-200 text-neutral-400'}`}
            >
              <span className="block font-semibold">{coupon.code}</span>
              <span className="mt-1 block text-xs">{coupon.label}</span>
              {cart.totals.food < coupon.minFood && (
                <span className="mt-1 block text-xs">
                  ขาดอีก {formatBaht(coupon.minFood - cart.totals.food)}
                </span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>
      <ConfirmDialog
        open={Boolean(removing)}
        title="ลบรายการนี้?"
        confirmLabel="ลบรายการ"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          cart.remove(removing.key)
          setRemoving(null)
        }}
      >
        {removing?.name}
      </ConfirmDialog>
    </div>
  )
}
