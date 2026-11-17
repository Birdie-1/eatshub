import ScreenStub from '@/shared/components/ScreenStub'
import StubLink from '@/shared/components/StubLink'

export default function Home() {
  return (
    <ScreenStub id="C2" title="หน้าแรก">
      <StubLink to="/app/search">ค้นหา</StubLink>
      <StubLink to="/app/restaurant/1">ไปที่ร้าน</StubLink>
    </ScreenStub>
  )
}
