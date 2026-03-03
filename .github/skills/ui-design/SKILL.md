# UI 実装・スタイリング SKILL

## 目的

一貫性・アクセシビリティを満たす UI を再利用可能に実装する。

## 基本方針

- UI コンポーネントは `shadcn/ui` をベースに構築する。
- 推論/実装時は、まず MCP の利用可否を確認してから作業を進める。
- キーボード操作とスクリーンリーダー対応を前提に実装する。

## 実装ルール

- `components/ui` に汎用UI、`components/domain` にドメインUIを配置する。
- フォーム要素には `label` と適切な `aria-*` を設定する。
- デザインの一貫性を保ち、重複スタイルを避ける。

## 共通UIコンポーネントの使用

### Loading 状態
```tsx
import { LoadingSpinner, LoadingFallback } from '@/components/common/loading'

// スピナーのみ
<LoadingSpinner />

// メッセージ付きフォールバック
<LoadingFallback message="データを読み込んでいます..." />
```

### Error 状態
```tsx
import { ErrorFallback } from '@/components/common/error'

<ErrorFallback 
  error={error} 
  reset={() => refetch()} 
/>
```

### Empty 状態
```tsx
import { EmptyState } from '@/components/common/empty'

<EmptyState 
  title="タスクがありません"
  description="新しいタスクを作成してください"
  action={<Button>タスクを作成</Button>}
/>
```

## アクセシビリティチェックリスト

- [ ] すべてのインタラクティブ要素がキーボードで操作可能
- [ ] フォーカス順序が論理的
- [ ] 色に依存しない情報伝達
- [ ] 適切なARIA属性の設定
- [ ] 画像に代替テキスト
- [ ] 十分なコントラスト比（WCAG AA以上）

## パフォーマンス指針

### メモ化の使用基準
- リスト要素（10件以上）: `React.memo` を検討
- 高頻度で再計算される値: `useMemo`
- コールバック関数（子に渡す場合）: `useCallback`
- 慎重に使用し、過度なメモ化を避ける

