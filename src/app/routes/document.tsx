import type { RouteObject } from 'react-router-dom'
import { MainLayout } from '@/layout/main-layout'
import { DocumentTemplatePage } from '@/pages/document-template-page'
import { WorkspacePage } from '@/pages/workspace-page'
import { documentLoader } from '@/api/document'

export const documentRoute: RouteObject = {
  path: '/document',
  element: <MainLayout />,
  children: [
    {
      path: 'knowledge',
      element: <WorkspacePage />,
      loader: documentLoader,
    },
    {
      path: 'specification',
      element: <WorkspacePage />,
      loader: documentLoader,
    },
    {
      path: 'design',
      element: <WorkspacePage />,
      loader: documentLoader,
    },
    {
      path: 'sop',
      element: <WorkspacePage />,
      loader: documentLoader,
    },
    {
      path: 'meeting-minutes',
      element: <WorkspacePage />,
      loader: documentLoader,
    },
    {
      path: 'archive',
      element: <WorkspacePage />,
      loader: documentLoader,
    },
    {
      path: 'knowledge/category/:category',
      element: <WorkspacePage />,
      loader: documentLoader,
    },
    {
      path: 'templates',
      element: <DocumentTemplatePage />,
    },
  ],
}