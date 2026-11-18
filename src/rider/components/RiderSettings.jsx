import Switch from '@/rider/components/Switch'
import { useRiderStatus } from '@/state'

/** Shared controls, intentionally backed by the same preferences on R2 and R7. */
export default function RiderSettings() {
  const { online, autoAccept, setOnline, setAutoAccept } = useRiderStatus()
  return (
    <section
      aria-label="ตั้งค่ารับงาน"
      className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4"
    >
      {[
        {
          label: 'เปิดรับงาน',
          description: online ? 'พร้อมรับงานจัดส่ง' : 'ออฟไลน์ · พักรับงาน',
          checked: online,
          change: setOnline,
        },
        {
          label: 'รับงานอัตโนมัติ',
          description: 'รับงานที่จัดสรรให้โดยอัตโนมัติ',
          checked: autoAccept,
          change: setAutoAccept,
        },
      ].map(({ label, description, checked, change }) => (
        <div key={label} className="flex items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-1 text-[11px] leading-5 text-neutral-500">{description}</p>
          </div>
          <Switch label={label} checked={checked} onChange={change} />
        </div>
      ))}
    </section>
  )
}
