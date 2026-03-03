# コーディング規約 SKILL

## 目的

TypeScript/React の可読性・安全性・変更容易性を高める。

## 命名規則

- コンポーネント: `PascalCase`
- 関数・変数: `camelCase`
- 定数: `UPPER_SNAKE_CASE`（必要な場合のみ）
- 型: 役割がわかる名詞で定義
- カスタムフック: `use` プレフィックス
- イベントハンドラ: `handle` プレフィックス（例: `handleSubmit`）

## TypeScript ルール

- `TypeScript strict` 前提で実装する。
- `any` は原則禁止（必要時は理由を明示）。
- 型定義（`types`）を先に作ってからデータ実装する。
- Lint/Format警告は解消してからマージする。
- `unknown` を `any` の代わりに使用する。
- オプショナルプロパティは `?` で明示する。

## React ルール

- 1コンポーネント1責務
- Props の型は必ず定義
- `useEffect` の依存配列を正しく設定
- 副作用は `useEffect` に集約
- Props が5つを超えたら分割を検討

## 環境変数管理

- 機密情報は `.env.local` に記載（Git管理外）
- `.env.example` をテンプレートとして提供
- クライアント側で使用する変数は `VITE_` プレフィックス必須
- 環境変数は型付きで扱う

```typescript
// 環境変数の型定義例
type Env = {
  VITE_API_BASE_URL: string
}

const env: Env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
}
```

## コミット規約

### コミットメッセージ形式
```
<type>: <subject>

<body>
```

### Type の種類
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・設定変更

### 例
```
feat: タスク一覧ページを追加

- タスク一覧表示
- フィルタリング機能
- ページネーション
```

## 禁止事項

- マジックナンバー（定数化する）
- `console.log` の残置（デバッグ後は削除）
- 巨大な関数（50行を超えたら分割検討）
- 深いネスト（3階層を超えたら early return で改善）


