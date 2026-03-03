# アーキテクチャ・ディレクトリ構成 SKILL

## 目的

React + TypeScript + Vite で、保守しやすく拡張可能な Layered 構成を維持する。

## 基本方針

- ディレクトリは責務で分割する（`components`, `pages`, `routes`, `services`, `stores`, `hooks`, `types`）。
- ルーティングは `react-router` に統一する。
- UI とビジネスロジック、I/O を分離する。
- 型定義は必ず実装前に作成する。

## 推奨ディレクトリ例

```txt
src/
├── app/           # エントリーポイント、ルーター定義
├── pages/         # 画面コンポーネント
├── components/
│   ├── ui/        # shadcn/ui ベースの汎用UI
│   ├── domain/    # ドメイン固有のUIコンポーネント
│   └── common/    # Loading/Error/Empty など共通UI
├── services/      # API通信・外部連携
├── stores/        # Zustand グローバル状態
├── hooks/         # カスタムフック
├── types/         # 型定義
├── mocks/         # MSW モックハンドラ・データ
│   ├── handlers/  # エンドポイント別ハンドラ
│   ├── data/      # モックデータ
│   └── browser.ts # ワーカー設定
├── test/          # テスト設定・ユーティリティ
└── styles/        # グローバルスタイル
```

## ルール

- `pages` は画面構成に専念し、重い処理は `hooks` / `services` に委譲する。
- `app/router.tsx` にルート定義・ガードを集約し、ページ側に分散させない。
- 循環依存を作らない。依存方向は `pages → components/hooks → services → types`。
- 共通UIコンポーネント（Loading/Error/Empty）は `components/common` に配置。

## MSWハンドラの整理方針

- エンドポイント単位でハンドラを分割: `mocks/handlers/tasks.ts`, `mocks/handlers/users.ts`
- モックデータは `mocks/data/` に型と合わせて配置
- `mocks/handlers/index.ts` で全ハンドラをエクスポート
- 50行を超えるハンドラファイルは分割を検討

