import { useEffect, useRef } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/shared/api/queryClient'
import { useAuthStore } from '@/stores/authStore'
import AppRoutes from './routes'

function AuthBootstrap() {
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const hasBootstrapped = useRef(false)

  useEffect(() => {
    if (hasBootstrapped.current) {
      return
    }
    hasBootstrapped.current = true
    void restoreSession()
  }, [restoreSession])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <Toaster richColors />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
