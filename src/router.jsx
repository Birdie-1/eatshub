import { createBrowserRouter, Navigate } from 'react-router'

import Landing from '@/shared/pages/Landing'

import PhoneFrame from '@/shared/components/PhoneFrame'
import TabLayout from '@/customer/layouts/TabLayout'
import CustomerSignIn from '@/customer/pages/SignIn'
import Home from '@/customer/pages/Home'
import Search from '@/customer/pages/Search'
import Restaurant from '@/customer/pages/Restaurant'
import MenuItem from '@/customer/pages/MenuItem'
import Cart from '@/customer/pages/Cart'
import Checkout from '@/customer/pages/Checkout'
import Payment from '@/customer/pages/Payment'
import Tracking from '@/customer/pages/Tracking'
import Orders from '@/customer/pages/Orders'
import Account from '@/customer/pages/Account'
import Favorites from '@/customer/pages/Favorites'
import OrderSuccess from '@/customer/pages/OrderSuccess'
import RequireCustomer from '@/customer/components/RequireCustomer'

import AdminLayout from '@/admin/layouts/AdminLayout'
import AdminSignIn from '@/admin/pages/SignIn'
import Riders from '@/admin/pages/Riders'
import Dashboard from '@/admin/pages/Dashboard'
import RequireAdmin from '@/admin/components/RequireAdmin'

import RiderTabLayout from '@/rider/layouts/RiderTabLayout'
import RiderSignIn from '@/rider/pages/SignIn'
import RiderHome from '@/rider/pages/Home'
import RiderJob from '@/rider/pages/Job'
import RiderWallet from '@/rider/pages/Wallet'
import RiderIncome from '@/rider/pages/Income'
import RiderAccount from '@/rider/pages/Account'
import RequireRider from '@/rider/components/RequireRider'

/**
 * Route map — screen IDs match docs/REQUIREMENTS.md (C = customer app, R = rider app, A = back office).
 */
export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },

  // Customer app — always rendered inside the phone frame on desktop
  {
    path: '/app',
    element: <PhoneFrame />,
    children: [
      { path: 'signin', element: <CustomerSignIn /> }, // C1
      {
        element: <RequireCustomer />,
        children: [
          {
            // Screens that show the bottom navigation
            element: <TabLayout />,
            children: [
              { index: true, element: <Home /> }, // C2
              { path: 'cart', element: <Cart /> }, // C7
              { path: 'orders', element: <Orders /> }, // C11
              { path: 'account', element: <Account /> }, // C12
            ],
          },
          { path: 'search', element: <Search /> }, // C3
          { path: 'restaurant/:restaurantId', element: <Restaurant /> }, // C4 (+ C6 floating cart bar)
          { path: 'restaurant/:restaurantId/menu/:menuId', element: <MenuItem /> }, // C5
          { path: 'checkout', element: <Checkout /> }, // C8
          { path: 'payment/:method', element: <Payment /> }, // C9: promptpay | paypal
          { path: 'orders/:orderId', element: <Tracking /> }, // C10
          { path: 'account/favorites', element: <Favorites /> }, // C12 sub-page
          { path: 'success/:orderId', element: <OrderSuccess /> },
        ],
      },
    ],
  },

  // Rider app — same phone frame as the customer app
  {
    path: '/rider',
    element: <PhoneFrame />,
    children: [
      { path: 'signin', element: <RiderSignIn /> }, // R1
      {
        element: <RequireRider />,
        children: [
          {
            element: <RiderTabLayout />,
            children: [
              { index: true, element: <RiderHome /> }, // R2 (+ R3 new-job popup)
              { path: 'wallet', element: <RiderWallet /> }, // R5
              { path: 'income', element: <RiderIncome /> }, // R6
              { path: 'account', element: <RiderAccount /> }, // R7
            ],
          },
          { path: 'jobs/:orderId', element: <RiderJob /> }, // R4
        ],
      },
    ],
  },

  // Back office
  { path: '/admin/signin', element: <AdminSignIn /> }, // A1
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ), // A2
    children: [
      { index: true, element: <Dashboard /> }, // A5
      { path: 'riders', element: <Riders /> }, // A3
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
