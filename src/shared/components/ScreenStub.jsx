/**
 * Temporary placeholder for screens not built yet.
 * Delete the import from a page once the real screen replaces it.
 */
export default function ScreenStub({ id, title, children }) {
  return (
    <div className="flex flex-col gap-3 p-5">
      <span className="w-fit rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
        {id}
      </span>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-neutral-500">ยังไม่ได้ทำหน้านี้</p>
      {children && <div className="flex flex-wrap gap-2 pt-2">{children}</div>}
    </div>
  )
}
