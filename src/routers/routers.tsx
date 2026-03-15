import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router"

import { Home } from "@/pages/Home"
import { Documents } from "@/pages/Documents"

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home />} />
      <Route path="documents" element={<Documents />} />
    </Route>
  )
)
