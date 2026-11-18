import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { RiderProvider, restoreRiderSettings, useRider } from './RiderProvider'
import { walletSummary } from '@/data/riderProfile'

afterEach(() => vi.unstubAllGlobals())
describe('shared rider settings and balances', () => {
  it('restores only boolean preferences with safe defaults', () => {
    expect(restoreRiderSettings(null)).toEqual({ online: true, autoAccept: false })
    expect(restoreRiderSettings({ online: false, autoAccept: true, ignored: 1 })).toEqual({
      online: false,
      autoAccept: true,
    })
    expect(restoreRiderSettings({ online: 'false', autoAccept: 1 })).toEqual({
      online: true,
      autoAccept: false,
    })
  })
  it('shares one ledger-derived balance and persisted setting pair across consumers', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({ online: false, autoAccept: true }),
      setItem: vi.fn(),
    })
    const snapshots = []
    function Reader() {
      const value = useRider()
      snapshots.push(value)
      return null
    }
    renderToString(
      <RiderProvider>
        <Reader />
        <Reader />
      </RiderProvider>,
    )
    expect(snapshots[0]).toBe(snapshots[1])
    expect(snapshots[0]).toMatchObject({ online: false, autoAccept: true })
    expect(snapshots[0].credit).toEqual(walletSummary(snapshots[0].creditHistory))
    expect(snapshots[0].cash).toEqual(walletSummary(snapshots[0].cashHistory))
  })
  it('renders with blocked storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Blocked')
      },
      setItem: () => {
        throw new Error('Blocked')
      },
    })
    expect(() => renderToString(<RiderProvider>ready</RiderProvider>)).not.toThrow()
  })
})
