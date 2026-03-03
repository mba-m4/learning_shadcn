import { Navigate, createBrowserRouter } from 'react-router-dom'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { WorkspacePage } from '@/pages/workspace-page'
import { getAllSubmenuPaths } from '@/app/navigation-context'

const submenuRoutes = getAllSubmenuPaths().map((path) => ({
  path: path.replace(/^\//, ''),
  element: <WorkspacePage />,
}))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WorkspaceShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/overview" replace />,
      },
      ...submenuRoutes,
      {
        path: 'document/knowledge/category/:category',
        element: <WorkspacePage />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard/overview" replace />,
      },
    ],
  },
])
