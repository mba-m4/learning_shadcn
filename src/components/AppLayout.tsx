import { Outlet, useLocation } from "react-router"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const pageMeta = [
  {
    match: (pathname: string) => pathname === "/",
    title: "Workspace overview",
    description: "テンプレート全体の構成と CRUD 導線を確認できます。",
  },
  {
    match: (pathname: string) => pathname === "/documents",
    title: "Documents",
    description: "検索、並び順、削除確認を含む一覧フローです。",
  },
  {
    match: (pathname: string) => pathname === "/documents/new",
    title: "Create document",
    description: "新規作成と一覧・詳細の再取得を確認します。",
  },
  {
    match: (pathname: string) => pathname.endsWith("/edit"),
    title: "Edit document",
    description: "詳細キャッシュを維持したまま更新フローを確認します。",
  },
  {
    match: (pathname: string) => /^\/documents\/[^/]+$/.test(pathname),
    title: "Document detail",
    description: "単一リソース取得と削除フローを確認できます。",
  },
] as const

export function AppLayout() {
  const location = useLocation()
  const meta =
    pageMeta.find((item) => item.match(location.pathname)) ?? pageMeta[0]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <SidebarTrigger />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                shadcn sidebar shell
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight">
                {meta.title}
              </h1>
            </div>
          </div>
          <div className="px-4 pb-3 text-sm text-muted-foreground md:px-6">
            {meta.description}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
