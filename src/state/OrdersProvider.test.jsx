import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { OrdersProvider, useOrders } from './OrdersProvider'

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
