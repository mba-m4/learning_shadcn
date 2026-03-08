import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/app-header'

/**
 * メインレイアウト
 * ヘッダーとOutletのみ。サイドバーなどは各ページで定義する。
 */
export function MainLayout() {
  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <Outlet />
    </div>
  )
}
