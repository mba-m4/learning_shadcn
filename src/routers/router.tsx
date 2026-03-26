import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router"

import { AppLayout } from "@/components/AppLayout"
import { Home } from "@/pages/Home"
import { DocumentCreatePage } from "@/pages/documents/DocumentCreatePage"
import { DocumentDetailPage } from "@/pages/documents/DocumentDetailPage"
import { DocumentEditPage } from "@/pages/documents/DocumentEditPage"
import { DocumentsPage } from "@/pages/documents/DocumentsPage"

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />} path="/">
      <Route index element={<Home />} />
      <Route path="documents">
        <Route index element={<DocumentsPage />} />
        <Route path="new" element={<DocumentCreatePage />} />
        <Route path=":id" element={<DocumentDetailPage />} />
        <Route path=":id/edit" element={<DocumentEditPage />} />
      </Route>
    </Route>
  )
)
