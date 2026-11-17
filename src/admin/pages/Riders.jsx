/** A3 — rider list. Table columns and data: see docs/REQUIREMENTS.md §4. */
export default function Riders() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">จัดการไรเดอร์</h1>
        <p className="text-sm text-neutral-500">หน้าแรก / ไรเดอร์ / จัดการไรเดอร์</p>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
          A3
        </span>
        <p className="mt-3 text-sm text-neutral-500">ยังไม่ได้ทำตารางรายชื่อไรเดอร์</p>
      </div>
    </div>
  )
}
