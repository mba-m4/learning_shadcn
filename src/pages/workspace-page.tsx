import { useLocation } from 'react-router-dom'
import { getNavigationContext } from '@/app/navigation-context'
import { pageContentByPath } from '@/mocks/data/page-content'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  const { topNav, submenu } = getNavigationContext(location.pathname)
  const content =
    pageContentByPath[submenu.path] ??
    pageContentByPath['/dashboard/overview'] ?? {
      heading: `${topNav.label} / ${submenu.label}`,
      description: 'プレースホルダーページ',
      cards: [],
    }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{content.heading}</h1>
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
