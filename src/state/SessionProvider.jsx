import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { load, save } from './storage'

const SessionContext = createContext(null)
export const SESSION_KINDS = ['customer', 'admin', 'rider']
const SIGNED_OUT = { customerSignedIn: false, adminSignedIn: false, riderSignedIn: false }

/** Restores a stored session, keeping only known boolean flags (older saves lack `riderSignedIn`). */
export function restoreSession(saved) {
  const session = { ...SIGNED_OUT }
  if (saved && typeof saved === 'object')
    for (const key of Object.keys(SIGNED_OUT)) session[key] = saved[key] === true
  return session
}

/** Flips one app's flag; unknown kinds leave the session unchanged. */
export function setSignedIn(session, kind, signedIn) {
  if (!SESSION_KINDS.includes(kind)) return session
  return { ...session, [`${kind}SignedIn`]: signedIn }
}

/** Fake sign-in state for the customer app, the rider app and the back office (no real auth in the mockup). */
export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => restoreSession(load('session', null)))

  useEffect(() => save('session', session), [session])

  const value = useMemo(
    () => ({
      ...session,
      /** kind: 'customer' | 'admin' | 'rider' */
      signIn: (kind) => setSession((s) => setSignedIn(s, kind, true)),
      signOut: (kind) => setSession((s) => setSignedIn(s, kind, false)),
    }),
    [session],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/** { customerSignedIn, adminSignedIn, riderSignedIn, signIn(kind), signOut(kind) } */
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <AppProviders>')
  return ctx
}
