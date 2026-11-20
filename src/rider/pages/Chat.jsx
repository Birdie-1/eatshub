import { useEffect } from 'react'
import { useParams } from 'react-router'
import TopBar from '@/shared/components/TopBar'
import Button from '@/shared/components/Button'
import ChatThread from '@/shared/components/ChatThread'
import { useOrderClock } from '@/shared/hooks/useOrderClock'
import { useOrders } from '@/state'
import { useDemoCustomerReply } from '@/rider/useDemoCustomerReply'

/** R8 — rider's chat with the customer of an accepted job; read-only once delivered. */
export default function Chat() {
  const { orderId } = useParams()
  const { getOrder, sendMessage, markChatRead } = useOrders()
  const now = useOrderClock()
  const order = getOrder(orderId)
  const job = order?.riderJob ? order : null
  const count = job?.messages?.length ?? 0
  useEffect(() => {
    if (job) markChatRead(orderId, 'rider')
  }, [job, orderId, count, markChatRead])
  useDemoCustomerReply(job, now)

  if (!job)
    return (
      <div className="flex min-h-full flex-col bg-surface">
        <TopBar title="แชทกับลูกค้า" backTo="/rider" />
        <div className="space-y-4 p-6 text-center">
          <h2 className="text-xl font-semibold">ไม่พบงานนี้</h2>
          <Button to="/rider">กลับหน้าแรก</Button>
        </div>
      </div>
    )

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar title="แชทกับลูกค้า" backTo={`/rider/jobs/${job.id}`} />
      <p className="break-all border-b border-neutral-100 bg-white px-4 py-2 text-center text-xs text-neutral-500">
        ลูกค้า · {job.address.label} · {job.id}
      </p>
      <ChatThread
        order={job}
        side="rider"
        now={now}
        otherName="ลูกค้า"
        onSend={(text) => sendMessage(job.id, 'rider', text)}
      />
    </div>
  )
}
