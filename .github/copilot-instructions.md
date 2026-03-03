# Copilot Instructions (Project Rules)

## 前提条件

- 回答は必ず日本語で行うこと。
- 変更量が200行を超える可能性が高い場合は、実行前に次を確認すること。  
  「この指示では変更量が200行を超える可能性がありますが、実行しますか?」
- 大きい変更を行う場合は、先に計画を提示してから実装すること。

## プロジェクト方針

- 技術スタックは `React + TypeScript + Vite` を前提とする。
- パッケージマネージャーは `pnpm` に統一する（`npm` / `yarn` は使用禁止）。
- ルーティングは `react-router` で統一する。
- 状態管理は `Zustand` を使用する。
- UI は `shadcn/ui` を利用する。
- 推論/実装時は、まず MCP の利用可否を確認し、利用可能なら優先的に活用する。
- 現フェーズではバックエンド実装は行わず、API 連携は `MSW` でモックする。
- モックデータやレスポンス定義を作成する際は、必ず対応する TypeScript の型定義を先に用意する。
- 品質ゲートは以下を必須とする。
  - `ESLint + Prettier`
  - `TypeScript strict`
  - 単体テスト（Vitest）

## 参照スキルガイド

- アーキテクチャ・ディレクトリ構成  
  `.github/skills/architecture/SKILL.md`
- UI 実装・スタイリング  
  `.github/skills/ui-design/SKILL.md`
- 状態管理・データフェッチ  
  `.github/skills/state-management/SKILL.md`
- バックエンド連携・認証  
  `.github/skills/backend-integration/SKILL.md`
- コーディング規約  
  `.github/skills/coding-standards/SKILL.md`
- テスト戦略  
  `.github/skills/testing/SKILL.md`

## 実装時の共通ルール

- 変更は最小差分で行い、無関係なリファクタは避ける。
- UI・ロジック・I/O の責務分離を徹底する。
- 型安全性を優先し、`any` を安易に使わない。
- `MSW` のハンドラとレスポンスは `types` と整合させる。
- 実装後は可能な範囲で `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run` を確認する。

## 共通UIコンポーネント

- Loading: `@/components/common/loading`
- Error: `@/components/common/error`
- Empty: `@/components/common/empty`

## パッケージ追加の判断基準

新規パッケージ追加時は以下を確認する：
1. 既存ライブラリで代替できないか
2. バンドルサイズへの影響
3. メンテナンス状況（週次ダウンロード数、最終更新）
4. 型定義の提供有無
5. プロジェクトの技術方針との整合性

