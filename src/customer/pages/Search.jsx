import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ChevronLeft, Search as SearchIcon, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { findRestaurants, getCategory } from '@/data/restaurants'
import Button from '@/shared/components/Button'
import FloatingCartBar from '@/customer/components/FloatingCartBar'
import RestaurantCard from '@/customer/components/RestaurantCard'
import RestaurantFilterSheet from '@/customer/components/RestaurantFilterSheet'

/**
 * C3 Search / category results. All state lives in the URL so Back restores the same results:
 *   ?q=   text search (restaurant name, type, menu names)
 *   ?cat= category id from the home grid (title = category name, no search box)
 *   ?type= restaurant type from the filter sheet
 */
export default function Search() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  // Local copy of ?q= so typing (incl. Thai IME) never waits for the router; the URL follows it.
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const category = getCategory(params.get('cat'))
  const type = params.get('type')
  const results = findRestaurants({ q, categoryId: category?.id, type })

  const update = (changes, options) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, options)
  }

  // Leave the app only if Search was the first page opened (deep link); otherwise go back.
  const back = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/app'))

  const filterButton = (
    <button
      type="button"
      aria-label="ตัวกรอง"
      onClick={() => setFilterOpen(true)}
      className={`relative grid size-10 shrink-0 place-items-center rounded-full ${
        type ? 'bg-brand-light text-brand-dark' : 'hover:bg-neutral-100'
      }`}
    >
      <SlidersHorizontal className="size-5" />
      {type && <span className="absolute top-2 right-2 size-2 rounded-full bg-brand-dark" />}
    </button>
  )

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-1 border-b border-neutral-100 bg-white px-1 py-2">
        <button
          type="button"
          aria-label="ย้อนกลับ"
          onClick={back}
          className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-neutral-100"
        >
          <ChevronLeft className="size-6" />
        </button>

        {category ? (
          <h1 className="min-w-0 flex-1 truncate text-center text-base font-semibold">{category.name}</h1>
        ) : (
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-surface px-3">
            <SearchIcon className="size-4 shrink-0 text-muted" />
            <input
              type="search"
              autoFocus // opened from 🔍: ready to type
              enterKeyHint="search"
              placeholder="ค้นหาร้าน ประเภท หรือเมนู"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                update({ q: e.target.value }, { replace: true })
              }}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                aria-label="ล้างคำค้นหา"
                onClick={() => {
                  setQ('')
                  update({ q: null }, { replace: true })
                }}
                className="-mr-1 grid size-7 place-items-center rounded-full text-muted hover:bg-neutral-200"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
        )}

        {filterButton}
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-8">
        {(type || results.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{heading({ q, category, type, results })}</span>
            {type && (
              <button
                type="button"
                onClick={() => update({ type: null })}
                className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-dark"
              >
                {type}
                <X className="size-3.5" aria-label="ล้างตัวกรอง" />
              </button>
            )}
          </div>
        )}

        {results.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {results.map((r) => (
              <li key={r.id}>
                <RestaurantCard restaurant={r} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            onShowAll={() => {
              setQ('')
              setParams({})
            }}
          />
        )}
      </div>

      <FloatingCartBar />

      <RestaurantFilterSheet
        key={filterOpen ? 'open' : 'closed'}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={type}
        onApply={(t) => {
          setFilterOpen(false)
          update({ type: t })
        }}
      />
    </div>
  )
}

function heading({ q, category, type, results }) {
  if (results.length === 0) return 'ไม่พบผลลัพธ์'
  if (q.trim()) return `พบ ${results.length} ร้านสำหรับ “${q.trim()}”`
  if (category || type) return `พบ ${results.length} ร้าน`
  return `ร้านทั้งหมด (${results.length})`
}

function EmptyState({ onShowAll }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="relative mb-2 grid size-32 place-items-center rounded-full bg-brand-light">
        <span className="absolute top-3 right-4 size-3 rounded-full bg-brand" />
        <span className="absolute bottom-5 left-3 size-2 rounded-full bg-brand-dark/60" />
        <span className="grid size-20 place-items-center rounded-full bg-white shadow-sm">
          <SearchX className="size-10 text-brand-dark" strokeWidth={1.75} />
        </span>
      </div>
      <h2 className="text-lg font-semibold">ไม่พบร้านที่ค้นหา</h2>
      <p className="text-sm text-muted">ลองค้นหาด้วยคำอื่น หรือดูร้านทั้งหมดใกล้คุณ</p>
      <Button onClick={onShowAll} className="mt-2">
        ดูร้านทั้งหมด
      </Button>
    </div>
  )
}
