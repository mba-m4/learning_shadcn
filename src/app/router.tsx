import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { dashboardRoute } from '@/app/routes/dashboard'
import { workspaceRoute } from '@/app/routes/workspace'
import { documentRoute } from '@/app/routes/document'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard/overview" replace />,
  },
  dashboardRoute,
  documentRoute,
  workspaceRoute,
  {
    path: '*',
    element: <Navigate to="/dashboard/overview" replace />,
  },
]

export const router = createBrowserRouter(appRoutes)
