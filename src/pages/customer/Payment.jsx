import { useParams } from 'react-router'
import ScreenStub from '@/components/ScreenStub'
import StubLink from '@/components/StubLink'

const titles = { promptpay: 'ชำระด้วย PromptPay', paypal: 'ชำระด้วย PayPal' }

export default function Payment() {
  const { method } = useParams()
  return (
    <ScreenStub id="C9" title={titles[method] ?? 'ชำระเงิน'}>
      <StubLink to="/app/orders/demo">ชำระแล้ว</StubLink>
    </ScreenStub>
  )
}
