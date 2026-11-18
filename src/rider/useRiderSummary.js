import { useMemo } from 'react'
import {
  acceptRate,
  createCashHistory,
  createCreditHistory,
  createRiderActivity,
  riderToday,
  walletSummary,
} from '@/data/riderProfile'

/**
 * Rider numbers shared by several screens (R2 home cards and sheet, R5 wallets), built once per mount
 * from the mock history in riderProfile.js so every screen shows the same balances.
 * => { activity: { jobs, missed }, today: { earning, offered, accepted }, acceptRate,
 *      credit: { history, balance, pending }, cash: { history, balance, pending } }
 */
export function useRiderSummary() {
  return useMemo(() => {
    const now = new Date()
    const activity = createRiderActivity(now)
    const credit = createCreditHistory(now)
    const cash = createCashHistory(activity.jobs, now)
    return {
      activity,
      today: riderToday(activity, now),
      acceptRate: acceptRate(activity),
      credit: { history: credit, ...walletSummary(credit) },
      cash: { history: cash, ...walletSummary(cash) },
    }
  }, [])
}
