import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createRiderActivity,
  createCashHistory,
  createCreditHistory,
  walletSummary,
} from '@/data/riderProfile'
import { completedRiderJobs } from '@/data/riderReports'
import { useOrders } from './OrdersProvider'
const RiderContext = createContext(null)
/** One shared activity and ledger snapshot for R2/R5/R6/R7. */
export function RiderProvider({ children }) {
  const { riderOrders: orders } = useOrders()
  const [tick, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])
  const { now, activity } = useMemo(() => {
    const time = Math.max(tick, new Date().getTime())
    const base = createRiderActivity(time)
    const completed = completedRiderJobs(orders, time)
    const ids = new Set(completed.map((job) => job.id))
    return {
      now: time,
      activity: {
        ...base,
        jobs: [...completed, ...base.jobs.filter((job) => !ids.has(job.id))].sort(
          (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
        ),
      },
    }
  }, [tick, orders])
  const creditHistory = useMemo(() => createCreditHistory(now), [now])
  const cashHistory = useMemo(() => createCashHistory(activity.jobs, now), [activity, now])
  const value = useMemo(
    () => ({
      now,
      activity,
      creditHistory,
      cashHistory,
      credit: walletSummary(creditHistory),
      cash: walletSummary(cashHistory),
    }),
    [now, activity, creditHistory, cashHistory],
  )
  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>
}
export function useRider() {
  const context = useContext(RiderContext)
  if (!context) throw new Error('useRider must be used inside RiderProvider')
  return context
}
