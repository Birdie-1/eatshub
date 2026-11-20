import { useEffect } from 'react'
import { useOrders } from '@/state'
import { DEMO_REPLY_MS, needsDemoReply } from '@/state/chat'

/**
 * Simulated jobs have no customer, so the "customer" answers the rider's latest message after
 * DEMO_REPLY_MS. Used on R4 and R8 so the answer (and R4's unread badge) arrives on either screen.
 */
export function useDemoCustomerReply(order, now) {
  const { demoReply } = useOrders()
  const due = order && needsDemoReply(order, now) ? order.messages.length : 0
  const id = order?.id
  useEffect(() => {
    if (!due) return
    const timer = setTimeout(() => demoReply(id), DEMO_REPLY_MS)
    return () => clearTimeout(timer)
  }, [due, id, demoReply])
}
