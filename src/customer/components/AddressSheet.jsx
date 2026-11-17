import { Building2, Check, House } from 'lucide-react'
import BottomSheet from '@/shared/components/BottomSheet'
import { useAddress } from '@/state'

const icons = { home: House, office: Building2 }

/** Pick the delivery address (บ้าน / ออฟฟิศ). The choice is saved and reused as C8's default. */
export default function AddressSheet({ open, onClose }) {
  const { address, addresses, setAddress } = useAddress()

  return (
    <BottomSheet open={open} onClose={onClose} title="เลือกที่อยู่จัดส่ง">
      <ul className="flex flex-col gap-2">
        {addresses.map((a) => {
          const Icon = icons[a.id] ?? House
          const selected = a.id === address.id
          return (
            <li key={a.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setAddress(a.id)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${
                  selected ? 'border-brand bg-brand-light' : 'border-neutral-200'
                }`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-brand-dark shadow-sm">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{a.label}</span>
                  <span className="block text-sm text-muted">{a.detail}</span>
                </span>
                {selected && <Check className="size-5 shrink-0 text-brand-dark" />}
              </button>
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
