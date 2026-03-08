# 状態管理・データフェッチ SKILL

## 目的

UI状態・サーバー状態・フォーム状態を分離し、変更容易性を高める。

## 基本方針

- **ローカル状態**: `useState` を使用
- **API状態管理**: `TanStack Query`（React Query）を使用
- **グローバル状態**: `Zustand` を使用（認証情報、アプリ設定等）
- サーバー連携は現フェーズでは `MSW` モックを利用する。
- モックデータ作成時は先に `types` を定義する。

## ルール

- 同じデータを複数箇所に二重保持しない。
- 非同期処理は `loading/success/error` を明示する。
- API状態はTanStack Queryに任せ、Zustandには入れない。
- Zustandストアは最小限に保ち、UI一時状態を詰め込みすぎない。

## Zustand store の設計基準

### ストアに入れるべき状態
- 認証情報（ユーザー情報、トークン）
- アプリ全体のUI設定（テーマ、言語、サイドバー開閉）
- 複数画面で共有するデータ

### ストアに入れるべきでない状態
- 単一画面でのみ使う一時状態
- サーバーから取得した直後のキャッシュデータ
- フォーム入力中のデータ

### ストア作成の原則
- 1ファイル1ストア
- 状態とアクションをまとめて定義
- アクションは immutable に状態を更新

### 例

```typescript
// ✅ 良い例
type AuthStore = {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

// ❌ 悪い例：一時的なUI状態をストアに入れる
type BadStore = {
  isModalOpen: boolean // 単一画面の状態
  formData: FormData // フォーム入力中
}
```

## TanStack Query の使用方針

### 基本原則
- **サーバーから取得したデータは全てTanStack Queryで管理**
- Zustandにキャッシュデータを保存しない
- `useQuery` / `useMutation` でAPI状態を宣言的に扱う

### ディレクトリ構成
```
src/
├── api/           # API client定義
│   ├── client.ts  # axiosインスタンス等
│   └── endpoints/ # エンドポイント別の関数
├── hooks/
│   └── queries/   # TanStack Query hooks
│       ├── use-tasks-query.ts
│       └── use-user-mutation.ts
```

### 例
```typescript
// api/endpoints/tasks.ts
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')
  return response.json()
}

// hooks/queries/use-tasks-query.ts
import { useQuery } from '@tanstack/react-query'
import { fetchTasks } from '@/api/endpoints/tasks'

export function useTasksQuery() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })
}

// コンポーネントでの使用
function TaskList() {
  const { data, isLoading, error } = useTasksQuery()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback error={error} />
  
  return <ul>{data?.map(task => <li>{task.title}</li>)}</ul>
}
```

## フォームバリデーション方針

- 複雑なフォームは React Hook Form を使用する
- 単純なフォームは `useState` + カスタムバリデーション関数で対応
- バリデーションルールは `types` と一緒に定義

