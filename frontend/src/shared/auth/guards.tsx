import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types/api'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken, status } = useAuthStore()
  const location = useLocation()

  if (status === 'loading') {
    return <div className="p-6 text-sm">読み込み中...</div>
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function RequireRole({
  allowed,
  children,
}: {
  allowed: Role[]
  children: React.ReactNode
}) {
  const { currentUser, status, accessToken } = useAuthStore()

  if (status === 'loading') {
    return <div className="p-6 text-sm">読み込み中...</div>
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (!currentUser) {
    return <div className="p-6 text-sm">読み込み中...</div>
  }

  if (!allowed.includes(currentUser.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
