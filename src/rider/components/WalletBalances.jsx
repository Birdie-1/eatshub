import { Link } from 'react-router'
import { ChevronRight, CreditCard, Wallet } from 'lucide-react'
import { useRider } from '@/state'
import { formatBaht } from '@/shared/lib/format'

export default function WalletBalances({ links = false }) {
  const { credit, cash } = useRider()
  return (
    <section aria-label="ยอดกระเป๋าไรเดอร์" className="grid grid-cols-2 gap-3">
      {[
        {
          title: 'ยอดเครดิต',
          value: credit.balance,
          icon: CreditCard,
          tone: 'bg-brand-light text-brand-dark',
          to: '/rider/wallet?wallet=credit',
        },
        {
          title: 'กระเป๋าเงินสด',
          value: cash.balance,
          icon: Wallet,
          tone: 'bg-success-light text-success',
          to: '/rider/wallet?wallet=cash',
        },
      ].map(({ title, value, icon: Icon, tone, to }) => (
        <div key={title} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-3">
          <span className={`mb-3 inline-flex rounded-xl p-2 ${tone}`}>
            <Icon className="size-5" />
          </span>
          <p className="text-[11px] text-neutral-500">{title}</p>
          <p className="mt-2 text-lg font-bold tabular-nums">{formatBaht(value)}</p>
          {links && (
            <Link
              to={to}
              className="mt-2 flex min-h-11 items-center justify-between text-xs font-medium text-neutral-600"
            >
              ดูประวัติ
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      ))}
    </section>
  )
}
