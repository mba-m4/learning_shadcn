# React + TypeScript + Vite + shadcn/ui

このテンプレートは、Vite + React + TypeScript を土台にして、基本的な Web アプリの CRUD フローをまとめて試せるようにしたサンプルです。

## できること

- React Query で一覧取得と詳細取得を分離する
- mutation で作成、更新、削除を行う
- MSW を stateful な疑似バックエンドとして使う
- React Router で一覧、詳細、作成、編集の画面遷移を作る
- Zustand で検索条件や並び順などの UI 状態を保持する
- shadcn/ui の Button と Card を画面に組み込む

## 主なルート

- `/` : テンプレート概要
- `/documents` : 一覧、検索、並び順、削除導線
- `/documents/new` : 作成フォーム
- `/documents/:id` : 詳細表示
- `/documents/:id/edit` : 編集フォーム

## ディレクトリの役割

- `src/api` : HTTP 通信と Zod parse
- `src/queries/documents` : queryKey と query / mutation 定義
- `src/pages` : 画面
- `src/store` : Zustand による UI 状態
- `src/mocks` : MSW ハンドラー

## 起動

```bash
pnpm install
pnpm dev
```

## 確認コマンド

```bash
pnpm typecheck
pnpm lint
```

## 開発フロー

初心者向けの実装手順は [docs/development-flow.md](docs/development-flow.md) にまとめています。
