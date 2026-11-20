import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { OrdersProvider, restoreOrders, useOrders } from './OrdersProvider'
import { acceptJob, buildOrder } from './orders'
import { sampleCart } from './fixtures'

function Count() {
  const { orders, riderOrders } = useOrders()
  return (
    <p>
      {orders.length}/{riderOrders.length}
    </p>
  )
}
function history(entries = {}) {
  vi.stubGlobal('localStorage', { getItem: (key) => entries[key] ?? null, setItem: vi.fn() })
  return renderToString(
    <OrdersProvider>
      <Count />
    </OrdersProvider>,
  )
}
afterEach(() => vi.unstubAllGlobals())
describe('history restoration', () => {
  it('opens in a fresh/private window with four sample records', () =>
    expect(history()).toContain('>4<!-- -->/<!-- -->4<'))
  it('upgrades the old empty placeholder history once', () =>
    expect(history({ 'eatshub:orders': '[]' })).toContain('>4<!-- -->/<!-- -->4<'))
  it('preserves intentionally empty history after initialization', () =>
    expect(history({ 'eatshub:orders': '[]', 'eatshub:history-seeded': 'true' })).toContain(
      '>0<!-- -->/<!-- -->0<',
    ))
  it('falls back safely when browser storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Blocked')
      },
      setItem: () => {
        throw new Error('Blocked')
      },
    })
    expect(
      renderToString(
        <OrdersProvider>
          <Count />
        </OrdersProvider>,
      ),
    ).toContain('>4<!-- -->/<!-- -->4<')
  })
})
describe('simulated rider jobs', () => {
  const order = {
    id: 'EH-BKK-261118-00013',
    createdAt: '2026-11-18T05:00:00.000Z',
    items: [],
    totals: { total: 172.75 },
    address: { label: 'บ้าน', detail: 'x' },
  }
  it('are left out of the customer/back-office list but kept for the rider app', () => {
    const saved = JSON.stringify([order, { ...order, id: 'EH-BKK-261118-00014', simulated: true }])
    expect(history({ 'eatshub:orders': saved, 'eatshub:history-seeded': 'true' })).toContain(
      '>1<!-- -->/<!-- -->2<',
    )
  })
})
describe('restoreOrders (saved or synced from another tab)', () => {
  const order = {
    id: 'EH-BKK-261118-00013',
    createdAt: '2026-11-18T05:00:00.000Z',
    items: [],
    totals: { total: 172.75 },
    address: { label: 'บ้าน', detail: 'x' },
    riderJob: { step: 3, times: ['2026-11-18T05:00:05.000Z', '2026-11-18T05:00:06.000Z'] },
  }
  it('keeps complete orders, including the rider job state', () =>
    expect(restoreOrders([order])).toEqual([order]))
  it('drops incomplete records and non-array values', () => {
    expect(restoreOrders([order, null, { id: 'x' }, { ...order, createdAt: 'nope' }])).toEqual([order])
    expect(restoreOrders('corrupt')).toEqual([])
    expect(restoreOrders(null)).toEqual([])
  })
})
/** Hands the provider value to the test (called during render). */
function Capture({ onRender }) {
  onRender(useOrders())
  return null
}
describe('changes start from the latest saved orders (two windows at once)', () => {
  it('keeps a message another window saved after this one rendered', () => {
    const now = new Date()
    const job = acceptJob(
      buildOrder({
        cart: sampleCart,
        address: { label: 'บ้าน', detail: 'x' },
        payment: 'cod',
        now,
        seq: 13,
        offerToRider: true,
      }),
      now.getTime(),
    )
    const store = { 'eatshub:orders': JSON.stringify([job]), 'eatshub:history-seeded': 'true' }
    vi.stubGlobal('localStorage', {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => (store[key] = value),
    })
    let api
    const capture = (value) => (api = value)
    renderToString(
      <OrdersProvider>
        <Capture onRender={capture} />
      </OrdersProvider>,
    )
    // The rider window writes a message; this (customer) window still renders the older list.
    const other = { ...job, messages: [{ id: 1, from: 'rider', text: 'ถึงแล้วครับ', at: now.toISOString() }] }
    store['eatshub:orders'] = JSON.stringify([other])
    api.sendMessage(job.id, 'customer', 'กำลังลงไปค่ะ')
    const saved = JSON.parse(store['eatshub:orders'])[0]
    expect(saved.messages.map((message) => `${message.id}:${message.from}`)).toEqual([
      '1:rider',
      '2:customer',
    ])
  })
})
