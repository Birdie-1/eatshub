import ScreenStub from '@/shared/components/ScreenStub'
import StubLink from '@/shared/components/StubLink'

export default function Search() {
  return (
    <ScreenStub id="C3" title="ค้นหา / หมวดหมู่">
      <StubLink to="/app/restaurant/1">ไปที่ร้าน</StubLink>
      <StubLink to="/app">กลับ</StubLink>
    </ScreenStub>
  )
}
