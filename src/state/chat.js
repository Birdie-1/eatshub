import { getStatus } from './orders'

/**
 * Rider ↔ customer chat (R8 / C13), pure logic. Messages live on the order so they sync between the
 * customer and rider windows with the rest of the order; they are not part of the frozen snapshot.
 *
 * order.messages: [{ id: 1, 2, …, from: 'rider' | 'customer', text, at: ISO time }]
 * order.chatRead: { rider?: n, customer?: n } — how many messages that side had seen when it last opened
 * the chat (for the unread badge).
 */

export const CHAT_SIDES = ['rider', 'customer']
export const CHAT_MAX_LENGTH = 200
/** How long the simulated customer of a demo job takes to answer the rider. */
export const DEMO_REPLY_MS = 2500

export const QUICK_REPLIES = {
  rider: ['กำลังไปรับอาหารที่ร้านครับ', 'รับอาหารแล้ว กำลังไปส่งครับ', 'ถึงหน้าบ้านแล้วครับ', 'รอสักครู่นะครับ'],
  customer: ['รับทราบค่ะ', 'ฝากไว้ที่ป้อมยามได้เลยค่ะ', 'กำลังลงไปรับค่ะ', 'ขอบคุณค่ะ'],
}

/** What the simulated customer says, in turn, after each rider message on a demo job. */
export const DEMO_CUSTOMER_REPLIES = ['รับทราบค่ะ ขอบคุณนะคะ', 'ได้เลยค่ะ รออยู่นะคะ', 'โอเคค่ะ กำลังลงไปรับค่ะ']

/** Chat is open once the rider app accepted the order, while it is on its way (stages 2–4). */
export const canChat = (order, now = Date.now()) =>
  Boolean(order.riderJob) && [2, 3, 4].includes(getStatus(order, now))

/** Whether to show the chat link: while open, or read-only afterwards if anything was said. */
export const hasChat = (order, now = Date.now()) => canChat(order, now) || Boolean(order.messages?.length)

/** Adds a message (trimmed, cut to CHAT_MAX_LENGTH). Unchanged for empty text, unknown senders or closed chats. */
export function sendMessage(order, from, text, now = Date.now()) {
  const body = String(text ?? '')
    .trim()
    .slice(0, CHAT_MAX_LENGTH)
  if (!body || !CHAT_SIDES.includes(from) || !canChat(order, now)) return order
  const messages = order.messages ?? []
  return {
    ...order,
    messages: [...messages, { id: messages.length + 1, from, text: body, at: new Date(now).toISOString() }],
  }
}

/** Messages from the other side that `side` has not seen yet. */
export const unreadCount = (order, side) =>
  (order.messages ?? []).filter(
    (message, index) => message.from !== side && index >= (order.chatRead?.[side] ?? 0),
  ).length

/** `side` opened the chat. Returns the same order when there is nothing new, so it is safe in an effect. */
export function markChatRead(order, side) {
  const count = order.messages?.length ?? 0
  if ((order.chatRead?.[side] ?? 0) >= count) return order
  return { ...order, chatRead: { ...order.chatRead, [side]: count } }
}

/** A simulated job (no real customer) whose chat ends with an unanswered rider message. */
export const needsDemoReply = (order, now = Date.now()) =>
  order.simulated === true && canChat(order, now) && order.messages?.at(-1)?.from === 'rider'

/** The simulated customer answers. Unchanged when no answer is due, so a repeated call can't double it. */
export function addDemoReply(order, now = Date.now()) {
  if (!needsDemoReply(order, now)) return order
  const answered = order.messages.filter((message) => message.from === 'customer').length
  return sendMessage(order, 'customer', DEMO_CUSTOMER_REPLIES[answered % DEMO_CUSTOMER_REPLIES.length], now)
}
