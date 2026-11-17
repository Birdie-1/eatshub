import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { load, save } from './storage'

const SessionContext = createContext(null)
const SIGNED_OUT = { customerSignedIn: false, adminSignedIn: false }

/** Fake sign-in state for the customer app and the back office (no real auth in the mockup). */
export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => load('session', SIGNED_OUT))

  useEffect(() => save('session', session), [session])

  const value = useMemo(
    () => ({
      ...session,
      /** kind: 'customer' | 'admin' */
      signIn: (kind) => setSession((s) => ({ ...s, [`${kind}SignedIn`]: true })),
      signOut: (kind) => setSession((s) => ({ ...s, [`${kind}SignedIn`]: false })),
    }),
    [session],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/** { customerSignedIn, adminSignedIn, signIn(kind), signOut(kind) } */
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside <AppProviders>')
  return ctx
}
