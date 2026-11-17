import ScreenStub from '@/components/ScreenStub'
import StubLink from '@/components/StubLink'

export default function Checkout() {
  return (
    <ScreenStub id="C8" title="Checkout">
      <StubLink to="/app/payment/promptpay">PromptPay</StubLink>
      <StubLink to="/app/payment/paypal">PayPal</StubLink>
      <StubLink to="/app/orders/demo">เก็บเงินปลายทาง</StubLink>
    </ScreenStub>
  )
}
