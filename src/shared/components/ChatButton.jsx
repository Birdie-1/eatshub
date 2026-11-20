import { MessageCircle } from 'lucide-react'
import Button from './Button'

/** Secondary button that opens an order's chat (R4 → R8, C10 → C13), with a badge for unread messages. */
export default function ChatButton({ to, unread = 0, children, ...props }) {
  return (
    <Button variant="secondary" to={to} {...props}>
      <MessageCircle className="size-5" aria-hidden="true" />
      {children}
      {unread > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-xs font-bold text-white">
          {unread}
          <span className="sr-only"> ข้อความใหม่</span>
        </span>
      )}
    </Button>
  )
}
