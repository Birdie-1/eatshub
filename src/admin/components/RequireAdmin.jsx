import { Navigate, useLocation } from 'react-router'
import { useSession } from '@/state'

// Demo navigation guard; production authentication remains out of scope.
export default function RequireAdmin({ children }) {
  const { adminSignedIn } = useSession()
  const location = useLocation()
  if (!adminSignedIn) {
    return (
      <Navigate
        to="/admin/signin"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    )
  }
  return children
}
