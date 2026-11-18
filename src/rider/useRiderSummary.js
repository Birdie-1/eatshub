import { acceptRate, riderToday } from '@/data/riderProfile'
import { useRider } from '@/state'

/** R2 and R5–R7 read the same activity and wallet snapshot, including minute-boundary updates. */
export function useRiderSummary() {
  const { activity, now, creditHistory, cashHistory, credit, cash } = useRider()
  return {
    activity,
    today: riderToday(activity, now),
    acceptRate: acceptRate(activity),
    credit: { history: creditHistory, ...credit },
    cash: { history: cashHistory, ...cash },
  }
}
