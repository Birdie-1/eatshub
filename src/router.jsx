import { createBrowserRouter, Navigate } from 'react-router'

import Landing from '@/pages/Landing'

import PhoneFrame from '@/layouts/PhoneFrame'
import TabLayout from '@/layouts/TabLayout'
import CustomerSignIn from '@/pages/customer/SignIn'
import Home from '@/pages/customer/Home'
import Search from '@/pages/customer/Search'
import Restaurant from '@/pages/customer/Restaurant'
import MenuItem from '@/pages/customer/MenuItem'
import Cart from '@/pages/customer/Cart'
import Checkout from '@/pages/customer/Checkout'
import Payment from '@/pages/customer/Payment'
import Tracking from '@/pages/customer/Tracking'
import Orders from '@/pages/customer/Orders'
import Account from '@/pages/customer/Account'

import AdminLayout from '@/layouts/AdminLayout'
import AdminSignIn from '@/pages/admin/SignIn'
import Riders from '@/pages/admin/Riders'

/**
 * Route map — screen IDs match docs/REQUIREMENTS.md (C = customer app, A = back office).
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
    ],
  },

  // Back office
  { path: '/admin/signin', element: <AdminSignIn /> }, // A1
  {
    path: '/admin',
    element: <AdminLayout />, // A2
    children: [
      { index: true, element: <Navigate to="riders" replace /> },
      { path: 'riders', element: <Riders /> }, // A3
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
