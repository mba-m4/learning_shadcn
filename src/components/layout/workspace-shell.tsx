import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/app-header'
import { SidebarProvider } from '@/components/ui/sidebar'

/**
 * ワークスペース共通レイアウトシェル
 * - SidebarProviderで全体をラップし、shadcn/uiのSidebarシステムを有効化
 * - ヘッダーは全ページ共通
 * - 実際のサイドバーとコンテンツは各ページで定義
 */
export function WorkspaceShell() {
  return (
    <SidebarProvider>
      <div className="min-h-svh w-full bg-background text-foreground">
        <AppHeader />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
