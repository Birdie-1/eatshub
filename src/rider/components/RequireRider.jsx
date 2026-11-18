import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/state'

// Demo navigation guard for the rider app; real authentication stays out of scope.
export default function RequireRider() {
  const { riderSignedIn } = useSession()
  const location = useLocation()
  return riderSignedIn ? (
    <Outlet />
  ) : (
    <Navigate
      to="/rider/signin"
      replace
      state={{ from: location.pathname + location.search + location.hash }}
    />
  )
}
