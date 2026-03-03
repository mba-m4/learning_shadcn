# learning_shadcn

React + TypeScript + Vite + shadcn/ui の学習・実践プロジェクト

## 📦 Tech Stack

### Core
- **React 19** - UI ライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール

### UI & Styling
- **shadcn/ui** - 再利用可能なコンポーネント
- **Tailwind CSS v4** - ユーティリティファーストCSS
- **Radix UI** - アクセシブルなプリミティブ

### State & Routing
- **react-router** - ルーティング
- **Zustand** - 軽量状態管理

### Development & Testing
- **MSW (Mock Service Worker)** - API モック
- **Vitest** - 単体テスト
- **Prettier** - コードフォーマット
- **ESLint** - 静的解析

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10+

### Installation

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

### Available Commands

```bash
# 開発
pnpm dev              # 開発サーバー起動 (http://localhost:5173)

# ビルド
pnpm build            # 本番ビルド
pnpm preview          # ビルド結果のプレビュー

# コード品質
pnpm lint             # ESLint 実行
pnpm format           # Prettier でフォーマット
pnpm format:check     # フォーマットチェック
pnpm typecheck        # 型チェック

# テスト
pnpm test             # テスト (watch モード)
pnpm test:ui          # テスト UI で実行
pnpm test:run         # テスト (CI 用)
pnpm test:coverage    # カバレッジ計測
```

## 📁 Project Structure

```
src/
├── app/              # エントリーポイント、ルーター
├── pages/            # 画面コンポーネント
├── components/
│   ├── ui/          # shadcn/ui コンポーネント
│   ├── domain/      # ドメイン固有コンポーネント
│   └── common/      # 共通UI (Loading, Error, Empty)
├── services/        # API 通信
├── stores/          # Zustand ストア
├── hooks/           # カスタムフック
├── types/           # 型定義
├── mocks/           # MSW モックハンドラ
│   ├── handlers/
│   ├── data/
│   └── browser.ts
└── test/            # テスト設定
```

## 📖 Documentation

プロジェクトルールと実装ガイドラインは `.github/` ディレクトリに整備されています：

- [プロジェクト方針](.github/copilot-instructions.md) - 全体方針と共通ルール
- [アーキテクチャ](.github/skills/architecture/SKILL.md) - ディレクトリ構成と設計原則
- [UI実装](.github/skills/ui-design/SKILL.md) - shadcn/ui、アクセシビリティ
- [状態管理](.github/skills/state-management/SKILL.md) - Zustand、フォーム
- [バックエンド連携](.github/skills/backend-integration/SKILL.md) - MSW、エラーハンドリング
- [コーディング規約](.github/skills/coding-standards/SKILL.md) - 命名規則、環境変数
- [テスト戦略](.github/skills/testing/SKILL.md) - Vitest、テストパターン

## 🔧 MCP Integration

このプロジェクトは MCP (Model Context Protocol) サーバーと統合されています：

- **shadcn MCP** - shadcn/ui コンポーネントの管理
- **GitHub MCP** - GitHub 操作の効率化

セットアップ方法は [.github/MCP_GITHUB_SETUP.md](.github/MCP_GITHUB_SETUP.md) を参照してください。

## 🎯 Quality Gates

すべてのコミット前に以下を実行することを推奨：

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run
```

## 📝 License

MIT
