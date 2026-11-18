import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createRiderActivity,
  createCashHistory,
  createCreditHistory,
  walletSummary,
} from '@/data/riderProfile'
import { load, save } from './storage'

const RiderContext = createContext(null)
export function restoreRiderSettings(saved) {
  return {
    online: typeof saved?.online === 'boolean' ? saved.online : true,
    autoAccept: typeof saved?.autoAccept === 'boolean' ? saved.autoAccept : false,
  }
}
/** One shared snapshot and persisted preference pair for R2/R5/R6/R7. */
export function RiderProvider({ children }) {
  const [settings, setSettings] = useState(() => restoreRiderSettings(load('rider-settings', null)))
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => save('rider-settings', settings), [settings])
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
      ...settings,
      setOnline: (online) => setSettings((previous) => ({ ...previous, online: Boolean(online) })),
      setAutoAccept: (autoAccept) =>
        setSettings((previous) => ({ ...previous, autoAccept: Boolean(autoAccept) })),
    }),
    [now, activity, creditHistory, cashHistory, settings],
  )
  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>
}
export function useRider() {
  const context = useContext(RiderContext)
  if (!context) throw new Error('useRider must be used inside RiderProvider')
  return context
}
