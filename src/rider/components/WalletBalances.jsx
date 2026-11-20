import { CreditCard, Wallet } from 'lucide-react'
import { useRider } from '@/state'
import { formatBaht } from '@/shared/lib/format'

const wallets = [
  { key: 'credit', title: 'ยอดเครดิต', icon: CreditCard },
  { key: 'cash', title: 'กระเป๋าเงินสด', icon: Wallet },
]

/**
 * R5 balance cards, which double as the tabs that pick whose history shows below (`wallet-history`).
 * `selected` is 'credit' or 'cash'.
 */
export default function WalletBalances({ selected, onSelect }) {
  const { credit, cash } = useRider()
  const balance = { credit: credit.balance, cash: cash.balance }
  return (
    <div role="tablist" aria-label="ประเภทกระเป๋า" className="grid grid-cols-2 gap-3">
      {wallets.map(({ key, title, icon: Icon }) => {
        const active = selected === key
        return (
          <button
            key={key}
            type="button"
            role="tab"
            id={`wallet-${key}`}
            aria-selected={active}
            aria-controls="wallet-history"
            onClick={() => onSelect(key)}
            className={`min-w-0 rounded-2xl border bg-white p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin ${active ? 'border-brand ring-1 ring-brand' : 'border-neutral-200 hover:border-neutral-300'}`}
          >
            <span
              className={`flex items-center gap-1.5 text-xs ${active ? 'font-semibold text-ink' : 'text-neutral-500'}`}
            >
              <Icon className={`size-4 shrink-0 ${active ? 'text-brand-dark' : 'text-neutral-400'}`} />
              {title}
            </span>
            <span className="mt-2 block text-xl font-bold tabular-nums">{formatBaht(balance[key])}</span>
          </button>
        )
      })}
    </div>
  )
}
