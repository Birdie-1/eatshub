import { useEffect, useRef, useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'
import Button from '@/shared/components/Button'

export default function BlockRiderDialog({ rider, onCancel, onConfirm }) {
  const dialog = useRef(null)
  const [reason, setReason] = useState('')
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previous
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      aria-labelledby="block-rider-title"
      aria-describedby="block-rider-description"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
      className="admin-block-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-0 bg-white p-0 text-ink shadow-xl backdrop:bg-black/50"
    >
      <form
        className="p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (reason.trim()) onConfirm(rider.code, reason.trim())
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-xl bg-danger-light text-danger">
            <ShieldAlert className="size-6" />
          </span>
          <button
            type="button"
            onClick={onCancel}
            aria-label="ปิดหน้าต่าง Block Rider"
            className="grid size-11 place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100"
          >
            <X className="size-5" />
          </button>
        </div>
        <h2 id="block-rider-title" className="text-xl font-semibold">
          Block Rider
        </h2>
        <p id="block-rider-description" className="mt-2 text-sm leading-6 text-neutral-600">
          ระงับใช้งาน {rider.name}
          <br />
          <span className="text-neutral-400">{rider.code}</span>
        </p>
        <label htmlFor="block-rider-reason" className="mb-2 mt-5 block text-sm font-medium">
          เหตุผลการ Block <span className="text-danger">*</span>
        </label>
        <textarea
          id="block-rider-reason"
          autoFocus
          required
          maxLength={500}
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="กรุณาระบุเหตุผลการระงับใช้งาน"
          className="admin-input resize-y py-3"
        />
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          การเปลี่ยนสถานะเป็นการสาธิต รีเฟรชหน้าเพื่อกลับเป็นข้อมูลเริ่มต้น
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={!reason.trim()}
            className="bg-danger text-white hover:bg-danger/90 active:bg-danger"
          >
            ยืนยัน
          </Button>
        </div>
      </form>
    </dialog>
  )
}
