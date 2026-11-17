import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/state'
export default function RequireCustomer() {
  const { customerSignedIn } = useSession()
  const location = useLocation()
  return customerSignedIn ? (
    <Outlet />
  ) : (
    <Navigate
      to="/app/signin"
      replace
      state={{ from: location.pathname + location.search + location.hash }}
    />
  )
}
