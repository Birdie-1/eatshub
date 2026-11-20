import { useSearchParams } from 'react-router'
import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react'
import Badge from '@/shared/components/Badge'
import { formatAmount } from '@/shared/lib/format'
import { formatOrderDate } from '@/state/orders'
import { creditChannels } from '@/data/riderProfile'
import { useRider } from '@/state'
import WalletBalances from '@/rider/components/WalletBalances'
import RiderTabHeader from '@/rider/components/RiderTabHeader'

export default function Wallet() {
  const [params, setParams] = useSearchParams()
  const cashSelected = params.get('wallet') === 'cash'
  const { creditHistory, cashHistory, cash } = useRider()
  const history = cashSelected ? cashHistory : creditHistory
  return (
    <div className="min-w-0 bg-surface pb-5">
      <RiderTabHeader title="กระเป๋าเงิน">
        <Badge tone="brand">ข้อมูลตัวอย่าง</Badge>
      </RiderTabHeader>
      <div className="space-y-5 px-4 pt-5">
        <WalletBalances
          selected={cashSelected ? 'cash' : 'credit'}
          onSelect={(key) => setParams({ wallet: key }, { replace: true })}
        />
        <section
          id="wallet-history"
          role="tabpanel"
          aria-labelledby={`wallet-${cashSelected ? 'cash' : 'credit'}`}
          className="space-y-4"
        >
          {cashSelected ? (
            <div className="rounded-2xl border border-warning/20 bg-warning-light p-4">
              <p className="text-xs text-neutral-600">ยอดถอนรออนุมัติ</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatAmount(cash.pending)} ฿</p>
              <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                รายการรออนุมัติหักจากยอดคงเหลือแล้ว ไม่หักซ้ำเมื่ออนุมัติ
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <h2 className="text-sm font-semibold">ช่องทางการเติมเครดิต</h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-xs text-neutral-600">
                {creditChannels.map((channel) => (
                  <li key={channel}>{channel}</li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-5 text-neutral-400">
                แสดงข้อมูลช่องทางเท่านั้น ไม่มีการเติมเงินจริง
              </p>
            </div>
          )}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold">ประวัติ{cashSelected ? 'กระเป๋าเงินสด' : 'เครดิต'}</h2>
            <ul className="divide-y divide-neutral-100">
              {history.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <span
                    className={`mt-1 grid size-8 shrink-0 place-items-center rounded-full ${item.amount > 0 ? 'bg-success-light text-success' : 'bg-neutral-100 text-neutral-500'}`}
                  >
                    {item.amount > 0 ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <strong
                        className={`whitespace-nowrap text-sm tabular-nums ${item.amount > 0 ? 'text-success' : 'text-ink'}`}
                      >
                        {item.amount > 0 ? '+' : '−'}
                        {formatAmount(Math.abs(item.amount))} ฿
                      </strong>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400">{formatOrderDate(item.at)}</p>
                    {item.orderId && (
                      <p className="mt-0.5 break-all text-[11px] tabular-nums text-neutral-400">
                        {item.orderId}
                      </p>
                    )}
                    {item.status && (
                      <div className="mt-2">
                        <Badge tone={item.status === 'pending' ? 'warning' : 'success'}>
                          {item.status === 'pending' ? 'รออนุมัติ' : 'อนุมัติแล้ว'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <p className="flex items-start gap-2 text-[11px] leading-5 text-neutral-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          ยอดและประวัติเป็นข้อมูลสาธิต ไม่มีการเติมหรือถอนเงินจริง
        </p>
      </div>
    </div>
  )
}
