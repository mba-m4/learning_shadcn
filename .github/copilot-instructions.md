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
- **UI実装は `shadcn/ui` を優先**。新しいUIが必要な場合は、まずshadcn/uiのコンポーネントで対応可能か検討してから、カスタムコンポーネント実装を検討する。
- アイコンは `lucide-react` を使用する。
- `MSW` のハンドラとレスポンスは `types` と整合させる。
- 実装後は可能な範囲で `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run` を確認する。

## Git運用ルール

### コミット粒度の原則

- **1コミット = 1責務**: 独立してレビュー・検証できる最小単位でコミットする。
- **目安**: 1コミットあたり1～数ファイル、100～300行程度を基本とする。
- **依存関係がある場合のみまとめる**: 型定義とその利用コードなど、切り離せない場合は同一コミット可。
- **shadcn/ui追加は別コミット**: UIコンポーネント追加とビジネスロジック実装は分離する。

### 実装フロー

1. **実装計画の提示**: 大きい変更の前に、コミット単位を含めた実装計画を提示し、確認を得る。
2. **小さい単位で実装**: 機能を分割し、1コミット分の実装を完了させる。
3. **検証**: 該当範囲で `pnpm lint && pnpm typecheck && pnpm test:run` を実行。
4. **コミット・プッシュ**: 検証が通った綺麗な状態のみコミット・プッシュする。
5. **次の単位へ**: 上記を繰り返し、段階的に機能を完成させる。

### コミットメッセージ

- Conventional Commits 形式を使用（`feat:`, `fix:`, `chore:` 等）。
- 1行目: 変更内容の要約（50文字以内推奨）。
- 2行目以降: 必要に応じて詳細説明。

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

## ドキュメント運用ルール

### 保管場所

- 要件/仕様: `docs/specs/`
- 設計（画面/アーキ/API）: `docs/design/`
- 開発手順/運用手順: `docs/guides/`
- ADR（設計判断記録）: `docs/adr/`

### 命名規則

- 形式: `kebab-case` + 用途サフィックス
- 仕様書: `xxx-mvp-spec.md` / `xxx-detail-spec.md`
- 設計書: `xxx-design.md`
- 手順書: `xxx-setup-guide.md` / `xxx-runbook.md`
- ADR: `NNNN-short-title.md`（例: `0001-routing-strategy.md`）

### 更新ルール

- 仕様変更のPRでは、対応する `docs/` を同時更新する。
- 実装前に仕様が未確定なら、先に `docs/specs/` を更新して合意を取る。
- 画面遷移・API契約・型定義方針の変更時は必ず履歴が残る形で更新する。

