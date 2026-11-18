import { useParams } from 'react-router'
import TopBar from '@/shared/components/TopBar'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import { riderProfile as rider } from '@/data/riderProfile'

export default function AccountDetails() {
  const { section } = useParams()
  const titles = { profile: 'ข้อมูลส่วนตัว', banks: 'บัญชีธนาคาร', vehicle: 'ยานพาหนะ' }
  const rows =
    section === 'profile'
      ? [
          ['รหัสไรเดอร์', rider.code],
          ['ระดับพาร์ทเนอร์', rider.partnerLevel],
          ['ชื่อ–นามสกุล', rider.name],
          ['เบอร์โทรศัพท์', rider.phone],
          ['อีเมล', rider.email],
        ]
      : [
          ['ยี่ห้อ', rider.vehicle.brand],
          ['รุ่น', rider.vehicle.model],
          ['ทะเบียนรถ', rider.vehicle.plate],
          ['จังหวัด', rider.vehicle.province],
        ]
  return (
    <div className="min-h-full bg-surface">
      <TopBar title={titles[section] ?? 'ข้อมูลบัญชี'} backTo="/rider/account" />
      <div className="space-y-4 p-4">
        <Badge tone="brand">ข้อมูลสมมติ · แสดงผลอย่างเดียว</Badge>
        {!titles[section] ? (
          <Card>
            <p className="text-sm">ไม่พบหน้าข้อมูลบัญชีนี้</p>
          </Card>
        ) : section === 'banks' ? (
          <>
            <p className="text-xs leading-6 text-neutral-500">
              บัญชีธนาคารสำหรับรับรายได้ เลขบัญชีปิดบางหลักและไม่ใช้รับเงินจริง
            </p>
            {rider.bankAccounts.map((account) => (
              <Card key={account.bank} className="border border-neutral-200 shadow-none">
                <h2 className="text-sm font-semibold">{account.bank}</h2>
                <p className="my-4 text-xl font-semibold tracking-wider">{account.number}</p>
                <p className="text-xs text-neutral-500">{account.holder}</p>
              </Card>
            ))}
          </>
        ) : (
          <Card className="border border-neutral-200 shadow-none">
            <dl className="divide-y divide-neutral-100">
              {rows.map(([label, value]) => (
                <div key={label} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-xs text-neutral-500">{label}</dt>
                  <dd className="mt-2 break-words text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
      </div>
    </div>
  )
}
