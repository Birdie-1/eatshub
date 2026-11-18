import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { OrdersProvider, restoreOrders, useOrders } from './OrdersProvider'

function Count() {
  return <p>{useOrders().orders.length}</p>
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
  it('opens in a fresh/private window with four sample records', () => expect(history()).toContain('>4<'))
  it('upgrades the old empty placeholder history once', () =>
    expect(history({ 'eatshub:orders': '[]' })).toContain('>4<'))
  it('preserves intentionally empty history after initialization', () =>
    expect(history({ 'eatshub:orders': '[]', 'eatshub:history-seeded': 'true' })).toContain('>0<'))
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
    ).toContain('>4<')
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
