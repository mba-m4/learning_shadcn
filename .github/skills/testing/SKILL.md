# テスト戦略 SKILL

## 目的

変更に強い開発を行うため、ユニット中心のテスト戦略を採用する。

## テストピラミッド

- ユニットテストを中心に構成する。
- 必要箇所のみ統合テストを追加する。
- E2E は重要フローに限定して後から拡張可能にする。

## 対象と優先度

1. 失敗時の影響が大きいロジック
2. バリデーション・データ変換
3. 認証・権限制御
4. 主要画面の分岐（ローディング/空/エラー）

## 実装ルール

- Arrange-Act-Assert で可読性を保つ。
- API モックは `MSW` を利用し、内部実装に依存しすぎない。
- スナップショットの乱用を避け、意図がわかるアサーションを書く。
- flaky なテストを放置しない。
- モックレスポンス作成時は、対応する TypeScript 型を先に定義する。

## テストフレームワーク: Vitest

### 基本構成
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### MSW との統合
```typescript
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'

it('should fetch and display data', async () => {
  server.use(
    http.get('/api/tasks', () => {
      return HttpResponse.json([{ id: '1', title: 'Test' }])
    })
  )
  
  render(<TaskList />)
  expect(await screen.findByText('Test')).toBeInTheDocument()
})
```

## 推奨コマンド

- `pnpm test` - watch モード
- `pnpm test:ui` - UI でテスト実行
- `pnpm test:run` - CI 用（1回実行）
- `pnpm test:coverage` - カバレッジ計測

## 完了条件

- 変更ロジックの主要分岐を検証できている。
- 回帰防止のテストが追加されている。
- CI でテストが安定して通る。

## テストすべきでないもの

- サードパーティライブラリの動作
- `shadcn/ui` コンポーネント自体
- 極めて単純なマッピング処理


