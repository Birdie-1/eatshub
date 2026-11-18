import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { restoreSession, SessionProvider, setSignedIn, useSession } from './SessionProvider'

const signedOut = { customerSignedIn: false, adminSignedIn: false, riderSignedIn: false }

function Flags() {
  const { customerSignedIn, adminSignedIn, riderSignedIn } = useSession()
  return <p>{[customerSignedIn, adminSignedIn, riderSignedIn].join(',')}</p>
}
function render(getItem) {
  vi.stubGlobal('localStorage', { getItem, setItem: vi.fn() })
  return renderToString(
    <SessionProvider>
      <Flags />
    </SessionProvider>,
  )
}
afterEach(() => vi.unstubAllGlobals())

describe('session flags', () => {
  it('signs each app in and out independently', () => {
    const rider = setSignedIn(signedOut, 'rider', true)
    expect(rider).toEqual({ ...signedOut, riderSignedIn: true })
    const both = setSignedIn(rider, 'customer', true)
    expect(setSignedIn(both, 'rider', false)).toEqual({ ...signedOut, customerSignedIn: true })
  })
  it('ignores unknown kinds', () => {
    expect(setSignedIn(signedOut, 'restaurant', true)).toBe(signedOut)
  })
  it('restores sessions saved before the rider app existed', () => {
    expect(restoreSession({ customerSignedIn: true, adminSignedIn: false })).toEqual({
      ...signedOut,
      customerSignedIn: true,
    })
  })
  it('drops corrupt or unexpected stored values', () => {
    expect(restoreSession('yes')).toEqual(signedOut)
    expect(restoreSession(null)).toEqual(signedOut)
    expect(restoreSession({ riderSignedIn: 'true', extra: true })).toEqual(signedOut)
  })
})

describe('SessionProvider storage', () => {
  it('reads the rider flag from storage', () => {
    const html = render((key) =>
      key === 'eatshub:session' ? JSON.stringify({ ...signedOut, riderSignedIn: true }) : null,
    )
    expect(html).toContain('false,false,true')
  })
  it('starts signed out when storage is blocked', () => {
    const html = render(() => {
      throw new Error('Blocked')
    })
    expect(html).toContain('false,false,false')
  })
})
