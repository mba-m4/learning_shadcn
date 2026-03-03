import { navigationConfig } from '@/mocks/data/navigation'

export type PageCard = {
  title: string
  description: string
  status: 'stable' | 'active' | 'draft'
}

export type PageContent = {
  heading: string
  description: string
  cards: PageCard[]
}

export const pageContentByPath: Record<string, PageContent> = Object.fromEntries(
  navigationConfig.flatMap((topNav) =>
    topNav.submenus.map((submenu) => {
      const cards: PageCard[] = [
        {
          title: `${submenu.label} 一覧`,
          description: `${topNav.label} の ${submenu.label} を表示するダミーウィジェットです。`,
          status: 'active',
        },
        {
          title: `フィルタ条件`,
          description: `サイドバー項目と連動した絞り込み結果を表示します。`,
          status: 'stable',
        },
        {
          title: `更新履歴`,
          description: `このセクションの最近の更新を表示するプレースホルダーです。`,
          status: 'draft',
        },
      ]

      return [
        submenu.path,
        {
          heading: `${topNav.label} / ${submenu.label}`,
          description: `仕様書に定義したナビゲーション情報に基づくダミーページです。`,
          cards,
        } satisfies PageContent,
      ]
    })
  )
)
