# 状態管理・データフェッチ SKILL

## 目的

UI状態・サーバー状態・フォーム状態を分離し、変更容易性を高める。

## 基本方針

- ローカル状態は `useState`、グローバル状態は `Zustand` を利用する。
- サーバー連携は現フェーズでは `MSW` モックを利用する。
- モックデータ作成時は先に `types` を定義する。

## ルール

- 同じデータを複数箇所に二重保持しない。
- 非同期処理は `loading/success/error` を明示する。
- ストアは最小限に保ち、UI一時状態を詰め込みすぎない。

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

## フォームバリデーション方針

- 複雑なフォームは React Hook Form を使用する
- 単純なフォームは `useState` + カスタムバリデーション関数で対応
- バリデーションルールは `types` と一緒に定義

