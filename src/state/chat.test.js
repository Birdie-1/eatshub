import { describe, expect, it } from 'vitest'
import {
  addDemoReply,
  canChat,
  CHAT_MAX_LENGTH,
  DEMO_CUSTOMER_REPLIES,
  hasChat,
  markChatRead,
  needsDemoReply,
  sendMessage,
  unreadCount,
} from './chat'
import { acceptJob, advanceJob, buildOrder } from './orders'
import { sampleCart } from './fixtures'

const t0 = Date.parse('2026-11-20T05:00:00Z')
const create = (offerToRider = true) =>
  buildOrder({
    cart: sampleCart,
    address: { label: 'บ้าน', detail: 'ที่อยู่ตัวอย่าง' },
    payment: 'cod',
    now: new Date(t0),
    seq: 13,
    offerToRider,
  })
/** Rider accepted at +1s (stage 2). */
const accepted = (order = create()) => acceptJob(order, t0 + 1000)
const delivered = () => {
  let job = accepted()
  for (const step of [2, 3, 4]) job = advanceJob(job, step, t0 + 2000)
  return job
}
const at = t0 + 5000

describe('canChat / hasChat', () => {
  it('opens once the rider accepted, while the order is on its way (stages 2–4)', () => {
    let job = accepted()
    for (const step of [2, 3, 4]) {
      expect(canChat(job, at)).toBe(true)
      job = advanceJob(job, step, t0 + 2000)
    }
    expect(canChat(job, at)).toBe(false) // delivered
  })
  it('stays closed for orders no rider app took, still offered, or cancelled', () => {
    expect(canChat(create(false), t0 + 9000)).toBe(false) // clock-driven, stage 2
    expect(canChat(create(), t0)).toBe(false) // still offered
    expect(canChat({ ...accepted(), cancelled: true }, at)).toBe(false)
  })
  it('keeps a delivered chat readable only if there were messages', () => {
    expect(hasChat(delivered(), at)).toBe(false)
    const talked = sendMessage(accepted(), 'rider', 'ถึงแล้วครับ', at)
    const done = [2, 3, 4].reduce((job, step) => advanceJob(job, step, at), talked)
    expect(canChat(done, at)).toBe(false)
    expect(hasChat(done, at)).toBe(true)
  })
})

describe('sendMessage', () => {
  it('appends a trimmed message with sender, numbered id and time', () => {
    let job = sendMessage(accepted(), 'rider', '  ถึงหน้าบ้านแล้วครับ  ', at)
    job = sendMessage(job, 'customer', 'กำลังลงไปค่ะ', at + 1000)
    expect(job.messages).toEqual([
      { id: 1, from: 'rider', text: 'ถึงหน้าบ้านแล้วครับ', at: new Date(at).toISOString() },
      { id: 2, from: 'customer', text: 'กำลังลงไปค่ะ', at: new Date(at + 1000).toISOString() },
    ])
  })
  it(`cuts messages to ${CHAT_MAX_LENGTH} characters`, () =>
    expect(sendMessage(accepted(), 'customer', 'ก'.repeat(300), at).messages[0].text).toHaveLength(
      CHAT_MAX_LENGTH,
    ))
  it('ignores empty text, unknown senders and closed chats', () => {
    const job = accepted()
    expect(sendMessage(job, 'rider', '   ', at)).toBe(job)
    expect(sendMessage(job, 'admin', 'สวัสดี', at)).toBe(job)
    const done = delivered()
    expect(sendMessage(done, 'rider', 'สวัสดี', at)).toBe(done)
    const timed = create(false)
    expect(sendMessage(timed, 'customer', 'สวัสดี', t0 + 9000)).toBe(timed)
  })
  it('leaves the order snapshot untouched', () => {
    const job = accepted()
    const talked = sendMessage(job, 'rider', 'สวัสดีครับ', at)
    for (const key of ['items', 'totals', 'address', 'rider', 'restaurant', 'notes', 'riderJob'])
      expect(talked[key]).toEqual(job[key])
  })
  it('survives JSON persistence (refresh / another window)', () => {
    const job = JSON.parse(JSON.stringify(sendMessage(accepted(), 'rider', 'สวัสดีครับ', at)))
    expect(sendMessage(job, 'customer', 'สวัสดีค่ะ', at).messages.map((m) => m.id)).toEqual([1, 2])
  })
})

describe('unread messages', () => {
  const talk = () => {
    let job = sendMessage(accepted(), 'rider', 'ถึงร้านแล้วครับ', at)
    job = sendMessage(job, 'rider', 'รออาหารสักครู่ครับ', at)
    return sendMessage(job, 'customer', 'ได้ค่ะ', at)
  }
  it('counts only the other side’s messages since the chat was last opened', () => {
    const job = talk()
    expect(unreadCount(job, 'customer')).toBe(2)
    expect(unreadCount(job, 'rider')).toBe(1)
    expect(unreadCount(accepted(), 'rider')).toBe(0)
  })
  it('clears for one side when that side opens the chat', () => {
    const read = markChatRead(talk(), 'customer')
    expect(unreadCount(read, 'customer')).toBe(0)
    expect(unreadCount(read, 'rider')).toBe(1)
    expect(unreadCount(sendMessage(read, 'rider', 'ถึงแล้วครับ', at), 'customer')).toBe(1)
  })
  it('returns the same order when nothing is unread', () => {
    const read = markChatRead(talk(), 'rider')
    expect(markChatRead(read, 'rider')).toBe(read)
    const job = accepted()
    expect(markChatRead(job, 'customer')).toBe(job)
  })
})

describe('demo customer replies (simulated jobs have no customer)', () => {
  const demo = () => accepted({ ...create(), simulated: true })
  it('answers after each rider message, rotating through the replies', () => {
    let job = sendMessage(demo(), 'rider', 'ถึงร้านแล้วครับ', at)
    expect(needsDemoReply(job, at)).toBe(true)
    job = addDemoReply(job, at + 2000)
    expect(job.messages.at(-1)).toMatchObject({ from: 'customer', text: DEMO_CUSTOMER_REPLIES[0] })
    expect(needsDemoReply(job, at)).toBe(false)
    expect(addDemoReply(job, at)).toBe(job) // no double reply
    job = addDemoReply(sendMessage(job, 'rider', 'กำลังไปส่งครับ', at), at)
    expect(job.messages.at(-1).text).toBe(DEMO_CUSTOMER_REPLIES[1])
  })
  it('never answers for real customer orders, before the rider writes, or after delivery', () => {
    const real = sendMessage(accepted(), 'rider', 'ถึงแล้วครับ', at)
    expect(needsDemoReply(real, at)).toBe(false)
    expect(addDemoReply(real, at)).toBe(real)
    expect(needsDemoReply(demo(), at)).toBe(false)
    const done = [2, 3, 4].reduce(
      (job, step) => advanceJob(job, step, at),
      sendMessage(demo(), 'rider', 'ถึงแล้วครับ', at),
    )
    expect(needsDemoReply(done, at)).toBe(false)
  })
})
