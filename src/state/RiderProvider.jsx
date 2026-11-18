import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createRiderActivity,
  createCashHistory,
  createCreditHistory,
  walletSummary,
} from '@/data/riderProfile'
const RiderContext = createContext(null)
/** One shared activity and ledger snapshot for R2/R5/R6/R7. */
export function RiderProvider({ children }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])
  const activity = useMemo(() => createRiderActivity(now), [now])
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
