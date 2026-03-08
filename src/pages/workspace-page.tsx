import { useLocation } from 'react-router-dom'
import { getNavigationContext } from '@/app/navigation-context'
import { useAllPageContentQuery } from '@/api/page-content'
import { useNavigationQuery } from '@/api/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { LoadingSpinner } from '@/components/common/loading'
import { ErrorFallback } from '@/components/common/error'

const statusLabel = {
  stable: 'Stable',
  active: 'Active',
  draft: 'Draft',
} as const

const statusVariant = {
  stable: 'secondary',
  active: 'default',
  draft: 'outline',
} as const

export function WorkspacePage() {
  const location = useLocation()
  
  // TanStack Query でナビゲーション設定とページコンテンツを取得
  const { data: navigationConfig, isLoading: isLoadingNav, error: navError } = useNavigationQuery()
  const { data: pageContentByPath, isLoading: isLoadingContent, error: contentError } = useAllPageContentQuery()

  if (isLoadingNav || isLoadingContent) return <LoadingSpinner />
  if (navError) return <ErrorFallback error={navError} />
  if (contentError) return <ErrorFallback error={contentError} />
  if (!navigationConfig || !pageContentByPath) return null

  const { topNav, submenu } = getNavigationContext(location.pathname, navigationConfig)

  const content =
    pageContentByPath[submenu.path] ??
    pageContentByPath['/dashboard/overview'] ?? {
      heading: `${topNav.label} / ${submenu.label}`,
      description: 'プレースホルダーページ',
      cards: [],
    }

  const hasLeftSidebar =
    submenu.leftSidebarItems && submenu.leftSidebarItems.length > 0
  const hasRightSidebar =
    submenu.rightSidebarItems && submenu.rightSidebarItems.length > 0

  // サイドバーがない場合はシンプルな表示
  if (!hasLeftSidebar && !hasRightSidebar) {
    return (
      <section className="mx-auto max-w-[1400px] space-y-4 px-4 py-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {content.heading}
          </h1>
          <p className="text-sm text-muted-foreground">{content.description}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {content.cards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  {card.title}
                  <Badge variant={statusVariant[card.status]}>
                    {statusLabel[card.status]}
                  </Badge>
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                ここに {submenu.label} のダミーデータ一覧が入ります。
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  // サイドバーがある場合はSidebarProviderを使用
  return (
    <SidebarProvider>
      {hasLeftSidebar && (
        <Sidebar side="left" collapsible="none">
          <SidebarContent>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold">{submenu.label}</h2>
            </div>
            <Separator />
            <div className="space-y-3 p-4">
              {submenu.leftSidebarItems?.map((item) => (
                <SidebarGroup key={item.label}>
                  <SidebarGroupLabel className="text-sm font-medium">
                    {item.label}
                  </SidebarGroupLabel>
                  {item.children && (
                    <SidebarGroupContent>
                      <div className="space-y-1 pl-3 text-sm text-muted-foreground">
                        {item.children.map((child) => (
                          <div
                            key={child}
                            className="rounded-sm px-2 py-1 hover:bg-accent/70 cursor-pointer transition-colors"
                          >
                            {child}
                          </div>
                        ))}
                      </div>
                    </SidebarGroupContent>
                  )}
                </SidebarGroup>
              ))}
            </div>
          </SidebarContent>
        </Sidebar>
      )}

      <SidebarInset>
        <section className="mx-auto max-w-[1400px] space-y-4 px-4 py-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {content.heading}
            </h1>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.cards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    {card.title}
                    <Badge variant={statusVariant[card.status]}>
                      {statusLabel[card.status]}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  ここに {submenu.label} のダミーデータ一覧が入ります。
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </SidebarInset>

      {hasRightSidebar && (
        <Sidebar side="right" collapsible="none">
          <SidebarContent>
            <div className="px-4 py-3">
              <h2 className="text-sm font-semibold">オプション</h2>
            </div>
            <Separator />
            <div className="space-y-3 p-4">
              {submenu.rightSidebarItems?.map((item) => (
                <SidebarGroup key={item.label}>
                  <SidebarGroupLabel className="text-sm font-medium">
                    {item.label}
                  </SidebarGroupLabel>
                  {item.children && (
                    <SidebarGroupContent>
                      <div className="space-y-1 pl-3 text-sm text-muted-foreground">
                        {item.children.map((child) => (
                          <div
                            key={child}
                            className="rounded-sm px-2 py-1 hover:bg-accent/70 cursor-pointer transition-colors"
                          >
                            {child}
                          </div>
                        ))}
                      </div>
                    </SidebarGroupContent>
                  )}
                </SidebarGroup>
              ))}
            </div>
          </SidebarContent>
        </Sidebar>
      )}
    </SidebarProvider>
  )
}
