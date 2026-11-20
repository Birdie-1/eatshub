import { useEffect, useRef, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { canChat, CHAT_MAX_LENGTH, QUICK_REPLIES } from '@/state/chat'

const time = (value) =>
  new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }).format(
    new Date(value),
  )

/**
 * Rider ↔ customer chat thread for one order (R8 rider side, C13 customer side). `side` ('rider' |
 * 'customer') is who uses this screen: their messages sit on the right in brand yellow. Quick replies and
 * the text box show only while the chat is open (`canChat`); afterwards the thread is read-only.
 * Fills the rest of a `flex flex-col` page; the input bar is sticky so it stays inside the phone frame.
 */
export default function ChatThread({ order, side, now, otherName, onSend }) {
  const [text, setText] = useState('')
  const end = useRef(null)
  const messages = order.messages ?? []
  const open = canChat(order, now)

  // Keep the newest message in view (the page scrolls inside #phone-scroll on desktop and phones).
  useEffect(() => {
    const scroller = end.current?.closest('#phone-scroll') ?? document.scrollingElement
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  }, [messages.length])

  const send = (value) => {
    if (!value.trim()) return
    onSend(value)
    setText('')
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4">
        {messages.length === 0 && (
          <p className="m-auto max-w-60 text-center text-sm leading-6 text-neutral-500">
            {open ? `ยังไม่มีข้อความ เริ่มคุยกับ${otherName}ได้เลย` : 'ไม่มีข้อความในออเดอร์นี้'}
          </p>
        )}
        <ol role="log" aria-label={`ข้อความกับ${otherName}`} className="flex flex-col gap-3">
          {messages.map((message) => {
            const mine = message.from === side
            return (
              <li
                key={message.id}
                className={`flex max-w-[80%] flex-col ${mine ? 'items-end self-end' : 'items-start self-start'}`}
              >
                <span className="sr-only">{mine ? 'คุณ' : otherName}:</span>
                <p
                  className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-6 ${mine ? 'rounded-br-md bg-brand' : 'rounded-bl-md bg-white shadow-sm'}`}
                >
                  {message.text}
                </p>
                <time dateTime={message.at} className="mt-1 px-1 text-[11px] text-neutral-400">
                  {time(message.at)}
                </time>
              </li>
            )
          })}
        </ol>
        <div ref={end} />
      </div>

      <div className="sticky bottom-0 border-t border-neutral-100 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        {open ? (
          <>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3" role="group" aria-label="ข้อความด่วน">
              {QUICK_REPLIES[side].map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => send(reply)}
                  className="min-h-9 shrink-0 rounded-xl border border-neutral-200 px-3 text-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin"
                >
                  {reply}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2 px-4"
              onSubmit={(event) => {
                event.preventDefault()
                send(text)
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                พิมพ์ข้อความถึง{otherName}
              </label>
              <input
                id="chat-input"
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={CHAT_MAX_LENGTH}
                placeholder="พิมพ์ข้อความ…"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-xl bg-surface px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
              <button
                type="submit"
                aria-label="ส่งข้อความ"
                disabled={!text.trim()}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-ink transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin disabled:opacity-40"
              >
                <SendHorizontal className="size-5" aria-hidden="true" />
              </button>
            </form>
          </>
        ) : (
          <p className="px-4 text-center text-sm text-neutral-500">การสนทนาสิ้นสุดแล้ว</p>
        )}
      </div>
    </>
  )
}
