# バックエンド連携・認証 SKILL

## 現フェーズ方針

- 現時点では実バックエンド実装は行わない。
- API連携は `MSW` によるモックで進める。
- request/response は TypeScript 型定義と整合させる。

## 将来への備え

- 実APIへ切替しやすいように `services` のインターフェースを固定する。
- コンポーネントから直接API呼び出しを行わず、`services` 経由に統一する。

## MSW モック作成手順

### 1. 型定義を先に作成
```typescript
// src/types/task.ts
export type Task = {
  id: string
  title: string
  done: boolean
}
```

### 2. モックデータを型と整合させる
```typescript
// src/mocks/data/tasks.ts
import type { Task } from '@/types/task'

export const mockTasks: Task[] = [
  { id: '1', title: 'テスト', done: false },
]
```

### 3. ハンドラを作成
```typescript
// src/mocks/handlers/tasks.ts
import { http, HttpResponse } from 'msw'
import { mockTasks } from '@/mocks/data/tasks'

export const taskHandlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json(mockTasks)
  }),
]
```

### 4. ハンドラを統合
```typescript
// src/mocks/handlers/index.ts
import { taskHandlers } from './tasks'

export const handlers = [...taskHandlers]
```

## エラーハンドリング戦略

### API レベルのエラーハンドリング
```typescript
// services/api.ts
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch('/api/tasks')
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    throw error
  }
}
```

### コンポーネントレベルのエラーハンドリング
```typescript
import { ErrorFallback } from '@/components/common/error'

function TaskList() {
  const [error, setError] = useState<Error | null>(null)
  
  if (error) {
    return <ErrorFallback error={error} reset={() => setError(null)} />
  }
  
  // ...
}
```

### Error Boundary の使用
- ルートレベルで Error Boundary を設置
- 画面単位で細かく Error Boundary を配置する必要はない
- 予期しないエラーをキャッチしてフォールバックUIを表示

## 認証・認可（将来実装）

- 認証状態は Zustand ストアで管理
- JWT トークンは HttpOnly Cookie で管理（セキュリティ）
- ルートガードは `react-router` の loader で実装
- 未認証時は自動的にログインページへリダイレクト


