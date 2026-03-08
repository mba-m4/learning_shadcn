import type { RouteObject } from 'react-router-dom'
import { MainLayout } from '@/layout/main-layout'
import { WorkspacePage } from '@/pages/workspace-page'
import { dashboardOverviewLoader } from '@/api/dashboard'

export const dashboardRoute: RouteObject = {
  path: '/dashboard',
  element: <MainLayout />,
  children: [
    {
      path: 'overview',
      element: <WorkspacePage />,
      loader: dashboardOverviewLoader,
    },
    {
      path: 'my-summary',
      element: <WorkspacePage />,
    },
  ],
}