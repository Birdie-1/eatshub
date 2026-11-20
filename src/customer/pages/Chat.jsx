import { useEffect } from 'react'
import { useParams } from 'react-router'
import TopBar from '@/shared/components/TopBar'
import Button from '@/shared/components/Button'
import ChatThread from '@/shared/components/ChatThread'
import { useOrderClock } from '@/shared/hooks/useOrderClock'
import { useOrders } from '@/state'
import { hasChat } from '@/state/chat'

/** C13 — customer's chat with the rider, for orders the rider app accepted; read-only once delivered. */
export default function Chat() {
  const { orderId } = useParams()
  const { getOrder, sendMessage, markChatRead } = useOrders()
  const now = useOrderClock()
  const order = getOrder(orderId)
  const chat = order && hasChat(order, now) ? order : null
  const count = chat?.messages?.length ?? 0
  useEffect(() => {
    if (chat) markChatRead(orderId, 'customer')
  }, [chat, orderId, count, markChatRead])

  if (!chat)
    return (
      <div className="flex min-h-full flex-col bg-surface">
        <TopBar title="แชทกับไรเดอร์" backTo={order ? `/app/orders/${order.id}` : '/app/orders'} />
        <div className="space-y-4 p-6 text-center">
          <h2 className="text-xl font-semibold">ยังแชทกับไรเดอร์ไม่ได้</h2>
          <p className="text-sm text-neutral-500">แชทได้เมื่อไรเดอร์รับออเดอร์แล้ว จนถึงตอนส่งอาหาร</p>
          <Button to={order ? `/app/orders/${order.id}` : '/app/orders'}>กลับไปที่ออเดอร์</Button>
        </div>
      </div>
    )

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <TopBar title="แชทกับไรเดอร์" backTo={`/app/orders/${chat.id}`} />
      <p className="break-all border-b border-neutral-100 bg-white px-4 py-2 text-center text-xs text-neutral-500">
        {chat.rider.name} · {chat.rider.plate}
      </p>
      <ChatThread
        order={chat}
        side="customer"
        now={now}
        otherName="ไรเดอร์"
        onSend={(text) => sendMessage(chat.id, 'customer', text)}
      />
    </div>
  )
}
