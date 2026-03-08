import type { RouteObject } from 'react-router-dom'
import { MainLayout } from '@/layout/main-layout'
import { WorkspacePage } from '@/pages/workspace-page'
import { workspaceLoader } from '@/api/workspace'

export const workspaceRoute: RouteObject = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'project/:page',
      element: <WorkspacePage />,
      loader: workspaceLoader,
    },
    {
      path: 'task/:page',
      element: <WorkspacePage />,
      loader: workspaceLoader,
    },
    {
      path: 'incident/:page',
      element: <WorkspacePage />,
      loader: workspaceLoader,
    },
    {
      path: 'ai/:page',
      element: <WorkspacePage />,
      loader: workspaceLoader,
    },
    {
      path: 'report/:page',
      element: <WorkspacePage />,
      loader: workspaceLoader,
    },
  ],
}