import { useRider } from '@/state'

/** Shared controls, intentionally backed by the same preferences on R2 and R7. */
export default function RiderSettings() {
  const { online, autoAccept, setOnline, setAutoAccept } = useRider()
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
          <button
            type="button"
            role="switch"
            aria-label={label}
            aria-checked={checked}
            onClick={() => change(!checked)}
            className={`relative h-11 w-14 shrink-0 rounded-xl ${checked ? 'bg-brand' : 'bg-neutral-200'}`}
          >
            <span
              className={`absolute top-2 size-7 rounded-lg bg-white shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>
      ))}
    </section>
  )
}
