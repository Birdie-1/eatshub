import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { RiderProvider, useRider } from './RiderProvider'
import { walletSummary } from '@/data/riderProfile'
import { OrdersProvider } from './OrdersProvider'

describe('shared rider activity and balances', () => {
  it('shares one snapshot and ledger-derived balances across consumers', () => {
    const snapshots = []
    function Reader() {
      snapshots.push(useRider())
      return null
    }
    renderToString(
      <OrdersProvider>
        <RiderProvider>
          <Reader />
          <Reader />
        </RiderProvider>
      </OrdersProvider>,
    )
    expect(snapshots[0]).toBe(snapshots[1])
    expect(snapshots[0].credit).toEqual(walletSummary(snapshots[0].creditHistory))
    expect(snapshots[0].cash).toEqual(walletSummary(snapshots[0].cashHistory))
  })
})
