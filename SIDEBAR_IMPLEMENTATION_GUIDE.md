# サイドバー実装ガイド

現在のプロジェクトで使用している shadcn Sidebar の実装方法を、ステップバイステップで説明します。

---

## 🎯 全体構造

```
SidebarProvider（最下層）
  └─ Sidebar（サイドバーの大枠）
      ├─ SidebarHeader（ロゴ/タイトル）
      ├─ SidebarContent（メニュー内容）
      └─ SidebarFooter（ユーザー情報）
  └─ SidebarInset（メイン領域）
      ├─ Header（ナビゲーション等）
      └─ Outlet（ページコンテンツ）
```

---

## 📋 Step 1: 基本的なセットアップ

### これが要ります

```tsx
import {
  SidebarProvider,   // ← これがラッパー
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar'
```

### 何をしてるのか

```
SidebarProvider = 「全体に Sidebar 機能を提供する親要素」
├─ Sidebar の state（open/close）を管理
├─ モバイル対応を管理
└─ Sidebar 内のコンポーネント全体が同じ情報を使える
```

---

## 📋 Step 2: ナビゲーション項目の定義

### コードの書き方

```tsx
type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard  // lucide-react のアイコン
  roles: Role[]  // どのロールなら表示するか
}

const mainNavItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'ダッシュボード',
    icon: LayoutDashboard,
    roles: ['leader', 'worker', 'safety_manager'],  // 全員に表示
  },
  {
    to: '/incidents',
    label: 'インシデント',
    icon: AlertTriangle,
    roles: ['leader', 'safety_manager'],  // この2つのロールだけに表示
  },
]
```

### 何をしてるのか

```
roles: ['leader', 'safety_manager']
  ↓
「このメニューはリーダーと安全管理者だけに見せる」
```

---

## 📋 Step 3: ロールベースのフィルタリング

### コードの書き方

```tsx
// 現在のユーザーが見るべき項目だけを抽出
const visibleMainItems = mainNavItems.filter((item) =>
  currentUser ? item.roles.includes(currentUser.role) : false
)
```

### 何をしてるのか

```
ユーザーロール = 'worker'

mainNavItems（全部）
  ├─ ダッシュボード（roles: ['leader', 'worker', 'safety_manager']）← 含む ✓
  ├─ インシデント（roles: ['leader', 'safety_manager']）← 含まない ✗
  └─ マニュアル（roles: ['leader', 'worker', 'safety_manager']）← 含む ✓

visibleMainItems = [ダッシュボード, マニュアル]（だけ表示）
```

---

## 📋 Step 4: メニュー項目の表示方法

### コードの書き方

```tsx
{visibleMainItems.map((item) => {
  const Icon = item.icon  // lucide-react のアイコンコンポーネント
  const active = isActivePath(item.to)  // 現在のページか？

  return (
    <SidebarMenuItem key={item.to}>
      <SidebarMenuButton 
        asChild 
        isActive={active}  // 選択状態を表示
        tooltip={item.label}  // ← tooltip！後で説明
      >
        <NavLink to={item.to} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})}
```

### 何をしてるのか

```
┌─────────────────────────────────────────────┐
│ SidebarMenuButton（ボタン）                  │
│  ├─ NavLink（リンク機能）                   │
│  │  ├─ Icon（アイコン表示）                 │
│  │  └─ span（テキスト表示）                 │
│  └─ tooltip（折畳時の説明）                 │
└─────────────────────────────────────────────┘
```

---

## 📋 Step 5: Tooltip とは何か？

### 使う理由

```
広がった状態:
┌─────────────────────┐
│ [📊] ダッシュボード  │ ← テキスト見えてる、説明不要
├─────────────────────┤
│ [⚠️] インシデント    │
└─────────────────────┘

折畳み状態:
┌────┐
│[📊]│ ← アイコンだけ、何かわからない😕
├────┤
│[⚠️]│
└────┘

マウスを乗せたら...
    ┌────────────────┐
    │ ダッシュボード  │ ← tooltip で説明！
    └────────────────┘
```

### コードの書き方

```tsx
<SidebarMenuButton 
  tooltip="ダッシュボード"  // ← これが tooltip
>
  ...
</SidebarMenuButton>
```

### 内部では何が起きてるのか

```tsx
// sidebar.tsx の内部実装
if (!tooltip) {
  return button  // ← tooltip がなければそのままボタン
}

return (
  <Tooltip>
    <TooltipTrigger asChild>{button}</TooltipTrigger>
    <TooltipContent
      side="right"
      hidden={state !== 'collapsed' || isMobile}
      // ↑ 重要！折畳時だけ表示、モバイルでは非表示
    >
      {tooltip}
    </TooltipContent>
  </Tooltip>
)
```

### いつ必要か？いつ不要か？

```
✅ 必要: アイコンだけで説明が不十分な場合
   例）📊 ← 何のアイコン？ → tooltip で「ダッシュボード」と説明

❌ 不要: テキストが常に見えてる場合
   例）[📊] ダッシュボード ← テキストで既に説明されてる
```

---

## 📋 Step 6: 管理セクション（展開/折畳み機能）

### 何をしてるのか

```
┌─────────────────────┐
│ メインメニュー      │ ← 常に展開
│ [ダッシュボード]    │
│ [インシデント]      │
├─ 管理 ▼             │ ← クリックで開閉できる
│ [署名前作業]        │ ← managementOpen = true なら表示
│ [会議]              │
│ [お知らせ管理]      │
└─────────────────────┘
```

### コードの書き方

```tsx
const [managementOpen, setManagementOpen] = useState(true)  // デフォルトで開いた状態

<SidebarMenuItem>
  <SidebarMenuButton asChild isActive={managementActive}>
    <button
      type="button"
      onClick={() => setManagementOpen((current) => !current)}
      // ↑ クリックで開閉を切り替え
    >
      <span>管理</span>
      <ChevronDown
        className={`transition-transform ${
          managementOpen ? 'rotate-0' : '-rotate-90'
        }`}
        // ↑ 矢印アイコンが回転して状態を示す
      />
    </button>
  </SidebarMenuButton>
</SidebarMenuItem>

{managementOpen && (
  // ← managementOpen が true の時だけ表示
  <SidebarMenu>
    {visibleManagementItems.map((item) => (
      // ... 各項目の表示
    ))}
  </SidebarMenu>
)}
```

---

## 📋 Step 7: ユーザー情報とログアウト

### コードの書き方

```tsx
<SidebarFooter>
  {currentUser && (
    <div className="rounded-xl border bg-sidebar-accent/40 px-3 py-2">
      <p className="text-sm">{currentUser.name}</p>
      <Badge className="mt-2">
        {roleLabel[currentUser.role]}  {/* リーダー、作業者、など */}
      </Badge>
    </div>
  )}
  
  <Button
    onClick={logout}
  >
    <LogOut className="mr-2 h-4 w-4" />
    ログアウト
  </Button>
</SidebarFooter>
```

### 何をしてるのか

```
SidebarFooter = 「サイドバーの下部（常に見える）」
  ├─ ユーザーの名前とロール（現在ログインしてるユーザー情報）
  └─ ログアウトボタン
```

---

## 🛠️ よくある質問と回答

### Q1: メニュー項目を追加したいんだけど？

```tsx
const mainNavItems: NavItem[] = [
  // 既存のメニュー...
  
  {
    to: '/new-page',          // 1. ルーティング先
    label: '新しいページ',      // 2. 表示名
    icon: SomeIcon,            // 3. lucide-react のアイコン（import すること）
    roles: ['leader'],         // 4. このロールなら表示
  },
]
```

### Q2: 特定のロールにだけメニューを見せたいんだけど？

```tsx
roles: ['leader']  // リーダーだけに表示
roles: ['worker', 'safety_manager']  // この2つのロールに表示
roles: ['leader', 'worker', 'safety_manager']  // 全員に表示
```

### Q3: tooltip は本当に必要？

```
答え: No。tooltip がなくても動く。

だけど折畳時にアイコンだけになるから、
ユーザーが「このアイコン何？」って困らないように、
説明を追加するための機能。

UX を良くしたいなら tooltip を追加する。
```

### Q4: `isActivePath` って何？

```tsx
const isActivePath = (target: string) =>
  location.pathname === target || 
  location.pathname.startsWith(`${target}/`)

// 例）
target = '/dashboard'
location.pathname = '/dashboard'
  → true（ダッシュボードページを見てる）

location.pathname = '/dashboard/details'
  → true（ダッシュボード配下のページを見てる）

location.pathname = '/incidents'
  → false（インシデントページを見てる）
```

### Q5: `asChild` って何？

```tsx
<SidebarMenuButton asChild>
  <NavLink to="/dashboard">...</NavLink>
</SidebarMenuButton>

asChild = true ↓
NavLink 要素がボタンの代わりになる
（NavLink がボタンのスタイリング・機能を引き継ぐ）

要は「SidebarMenuButton のスタイルを NavLink に適用する」ってこと
```

---

## 📚 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/components/layout/AppShell.tsx` | サイドバー全体の実装 |
| `src/components/ui/sidebar.tsx` | shadcn の Sidebar UI コンポーネント |
| `src/stores/authStore.ts` | ユーザー情報・ロール管理 |
| `src/types/api.ts` | Role 型の定義 |

---

## 🎨 カスタマイズ例

### テーマカラーを変えたい

```tsx
<SidebarHeader className="px-3 py-4">
  <div>
    {/* ロゴの背景色を変更 */}
    <span className="flex h-9 w-9 items-center justify-center 
                     rounded-xl bg-blue-600">
      {/* bg-blue-600 = 青色 */}
    </span>
  </div>
</SidebarHeader>
```

### メニューを折り畳みたくない（常に展開）

```tsx
// managementOpen 状態を使わない
{/* always show */}
<SidebarMenu>
  {visibleManagementItems.map((item) => (
    // ...
  ))}
</SidebarMenu>
```

### モバイル時にサイドバーを非表示

```tsx
<Sidebar 
  collapsible="offcanvas"  // ← これでモバイル対応
>
  {/* サイドバーの内容 */}
</Sidebar>
```

---

## ✅ チェックリスト：新しいサイドバーを作る時

- [ ] SidebarProvider で全体をラップしたか？
- [ ] NavItem[] で必要なメニュー項目を定義したか？
- [ ] ロール条件を正しく設定したか？
- [ ] 各メニュー項目に icon をインポートしたか？
- [ ] tooltip を追加したか？（オプション）
- [ ] SidebarFooter にユーザー情報を追加したか？
- [ ] ログアウト機能を実装したか？
- [ ] モバイルでのテストをしたか？

---

## 📖 参考資料

- shadcn 公式: https://ui.shadcn.com/docs/components/sidebar
- Radix UI Tooltip: https://www.radix-ui.com/docs/primitives/components/tooltip
- lucide-react アイコン: https://lucide.dev/

