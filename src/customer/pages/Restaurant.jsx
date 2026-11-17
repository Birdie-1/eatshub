import ScreenStub from '@/shared/components/ScreenStub'
import StubLink from '@/shared/components/StubLink'

export default function Restaurant() {
  return (
    <ScreenStub id="C4" title="รายละเอียดร้าน">
      <StubLink to="/app/restaurant/1/menu/1">ดูเมนู</StubLink>
      <StubLink to="/app/cart">ดูตะกร้า</StubLink>
    </ScreenStub>
  )
}
