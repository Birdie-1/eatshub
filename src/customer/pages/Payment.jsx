import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { CreditCard, QrCode, ShieldCheck } from 'lucide-react'
import Button from '@/shared/components/Button'
import Card from '@/shared/components/Card'
import TopBar from '@/shared/components/TopBar'
import { useCart, useAddress } from '@/state'
import { formatAmount } from '@/shared/lib/format'
import { usePlaceOrder } from '@/customer/usePlaceOrder'

function SampleQR() {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="QR ตัวอย่าง ไม่มีข้อมูลบัญชีรับเงิน"
      className="mx-auto w-full max-w-56 rounded-xl border-8 border-white bg-white"
    >
      {Array.from({ length: 21 * 21 }, (_, i) => {
        const x = i % 21,
          y = Math.floor(i / 21)
        return (x * 7 + y * 11 + x * y) % 5 < 2 ? (
          <rect key={i} x={x * 8 + 16} y={y * 8 + 16} width={7} height={7} fill="currentColor" />
        ) : null
      })}
      {[
        [16, 16],
        [128, 16],
        [16, 128],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={56} height={56} fill="white" />
          <rect x={x} y={y} width={56} height={56} fill="none" stroke="currentColor" strokeWidth={6} />
          <rect x={x + 16} y={y + 16} width={24} height={24} fill="currentColor" />
        </g>
      ))}
      <rect x="20" y="78" width="160" height="44" fill="white" />
      <text x="100" y="107" textAnchor="middle" fontSize="27" fontWeight="700" fill="currentColor">
        ตัวอย่าง
      </text>
    </svg>
  )
}

export default function Payment() {
  const { method } = useParams()
  const cart = useCart()
  const { address } = useAddress()
  const placeOrder = usePlaceOrder()
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + 600000)
  const [now, setNow] = useState(Date.now)
  const [busy, setBusy] = useState(false)
  const pending = useRef(null)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => () => clearTimeout(pending.current), [])
  if (!['promptpay', 'paypal'].includes(method)) return <Navigate to="/app/checkout" replace />
  if (!cart.items.length || !cart.totals.meetsMinOrder) return <Navigate to="/app/cart" replace />
  const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000))
  const expired = method === 'promptpay' && remaining === 0
  const confirm = () => {
    if (busy || expired) return
    setBusy(true)
    pending.current = setTimeout(() => placeOrder({ address, payment: method }), 1500)
  }
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar
        title={method === 'promptpay' ? 'ชำระด้วย PromptPay' : 'ยืนยันการชำระเงิน'}
        backTo="/app/checkout"
      />
      <div className="flex-1 space-y-4 p-4">
        <Card className="space-y-5 text-center shadow-none">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-light text-brand-dark">
            {method === 'promptpay' ? <QrCode className="size-7" /> : <CreditCard className="size-7" />}
          </span>
          <div>
            <h1 className="text-lg font-semibold">
              {method === 'promptpay' ? 'สแกน QR เพื่อทดลองชำระเงิน' : 'กำลังเชื่อมต่อผู้ให้บริการชำระเงิน'}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">{cart.restaurant.name}</p>
            <p className="mt-4 text-3xl font-bold" data-testid="payment-total">
              {formatAmount(cart.totals.total)} ฿
            </p>
          </div>
          {method === 'promptpay' ? (
            <>
              <SampleQR />
              <p className="text-sm font-semibold">eatsHub</p>
              <p className={`text-sm ${expired ? 'text-danger' : 'text-neutral-500'}`} role="timer">
                {expired
                  ? 'QR หมดอายุ'
                  : `หมดอายุใน ${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`}
              </p>
              {expired && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const time = Date.now()
                    setExpiresAt(time + 600000)
                    setNow(time)
                  }}
                >
                  สร้าง QR ใหม่
                </Button>
              )}
            </>
          ) : (
            <p className="rounded-xl bg-neutral-50 p-4 text-sm leading-7">
              วิธีชำระ: PayPal
              <br />
              หน้านี้เป็นการจำลองการยืนยันเท่านั้น
            </p>
          )}
          <p className="rounded-xl bg-brand-light p-3 text-xs leading-6 text-neutral-600">
            ตัวอย่างสำหรับการนำเสนอ ไม่สามารถใช้ชำระเงินจริง
            <br />
            ไม่มีข้อมูลบัญชีหรือ PromptPay จริงใน QR
          </p>
        </Card>
        <p className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="size-4" />
          ไม่มีการเก็บข้อมูลการเงิน
        </p>
      </div>
      <div className="customer-action-bar space-y-2">
        <Button size="lg" block disabled={busy || expired} onClick={confirm}>
          {busy ? 'กำลังตรวจสอบการชำระเงิน…' : method === 'promptpay' ? 'ฉันชำระเงินแล้ว' : 'ยืนยันการชำระเงิน'}
        </Button>
        <Button variant="ghost" block to={busy ? undefined : '/app/checkout'} disabled={busy}>
          ยกเลิก
        </Button>
      </div>
    </div>
  )
}
