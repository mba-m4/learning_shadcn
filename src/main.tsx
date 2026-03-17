import "./index.css"

import { StrictMode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ThemeProvider } from "@/components/theme-provider"

import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router/dom"
import { router } from "@/routers/router"

const queryClient = new QueryClient()

if (import.meta.env.DEV) {
  const { worker } = await import("@/mocks/browser")
  await worker.start({
    onUnhandledRequest: "bypass",
  })
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
