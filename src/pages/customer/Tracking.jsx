import { useParams } from 'react-router'
import ScreenStub from '@/components/ScreenStub'
import StubLink from '@/components/StubLink'

export default function Tracking() {
  const { orderId } = useParams()
  return (
    <ScreenStub id="C10" title={`ติดตามออเดอร์ ${orderId}`}>
      <StubLink to="/app/orders">ไปที่ออเดอร์</StubLink>
    </ScreenStub>
  )
}
