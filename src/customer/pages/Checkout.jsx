import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Banknote, CreditCard, MapPin, QrCode, ShieldCheck } from 'lucide-react'
import Button from '@/shared/components/Button'
import Card from '@/shared/components/Card'
import TopBar from '@/shared/components/TopBar'
import OrderSummary from '@/customer/components/OrderSummary'
import { useCart, useAddress } from '@/state'
import { formatAmount } from '@/shared/lib/format'
import { usePlaceOrder } from '@/customer/usePlaceOrder'

export default function Checkout() {
  const cart = useCart()
  const { address, addresses, setAddress } = useAddress()
  const [payment, setPayment] = useState('cod')
  const navigate = useNavigate()
  const placeOrder = usePlaceOrder()
  if (!cart.items.length) return <Navigate to="/app/cart" replace />
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar title={`ยอดรวมคำสั่งซื้อ ${formatAmount(cart.totals.total)} ฿`} backTo="/app/cart" />
      <div className="flex-1 space-y-4 p-4">
        <OrderSummary {...cart} notes={{ noteToStore: cart.noteToStore, noteToRider: cart.noteToRider }} />
        <Card className="border border-neutral-100 shadow-none">
          <fieldset>
            <legend className="mb-4 flex items-center gap-2 font-semibold">
              <MapPin className="size-5 text-brand-dark" />
              ที่อยู่จัดส่ง
            </legend>
            <div className="space-y-3">
              {addresses.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${address.id === item.id ? 'border-brand bg-brand-light/40' : 'border-neutral-200'}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={item.id}
                    checked={address.id === item.id}
                    onChange={() => setAddress(item.id)}
                    className="mt-1 size-4 shrink-0 accent-brand"
                  />
                  <span>
                    <strong className="text-sm">{item.label}</strong>
                    <span className="mt-1 block text-xs leading-6 text-neutral-500">{item.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
        <Card className="border border-neutral-100 shadow-none">
          <fieldset>
            <legend className="mb-4 font-semibold">วิธีชำระเงิน</legend>
            <div className="space-y-3">
              {[
                ['cod', 'เก็บเงินปลายทาง', Banknote],
                ['promptpay', 'PromptPay QR', QrCode],
                ['paypal', 'PayPal', CreditCard],
              ].map(([value, label, Icon]) => (
                <label
                  key={value}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${payment === value ? 'border-brand bg-brand-light/40' : 'border-neutral-200'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                    className="size-4 accent-brand"
                  />
                  <Icon className="size-5 text-neutral-500" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
        <p className="flex items-center gap-2 px-1 text-xs leading-6 text-neutral-500">
          <ShieldCheck className="size-4 shrink-0" />
          การชำระเงินทั้งหมดเป็นการจำลอง ไม่มีการเรียกเก็บเงินจริง
        </p>
      </div>
      <div className="customer-action-bar">
        <Button
          size="lg"
          block
          disabled={!cart.totals.meetsMinOrder}
          onClick={() =>
            payment === 'cod' ? placeOrder({ address, payment }) : navigate(`/app/payment/${payment}`)
          }
        >
          ชำระเงิน · {formatAmount(cart.totals.total)} ฿
        </Button>
      </div>
    </div>
  )
}
