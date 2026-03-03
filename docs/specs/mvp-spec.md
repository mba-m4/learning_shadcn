# 作業管理ツール MVP仕様書（AI/RAG中核型）

## 1. 目的とMVP定義

### 目的
- 作業管理（Task / Document / Incident）を一元化する。
- AI機能で情報を横断検索し、業務判断を支援する。

### MVP成功条件
- 各ドメインの一覧と基本フィルタが機能する。
- AI画面で横断検索し、回答と参照元リンクを表示できる。
- `react-router` で主要導線が成立している。
- 型定義先行（`types`）で `MSW` モックAPIが整合している。

### MVP範囲外（初期フェーズ）
- 実バックエンド実装
- 本番認証・権限制御の完成実装
- 高度な分析（自動レポート生成など）

## 2. 画面一覧と遷移（react-router前提）

### 優先実装方針（このMVPの重点）
- 本MVPは「ヘッダー + ナビゲーション + サイドバー（情報設計）」を最優先で実装する。
- 各メニューの内部項目（サブメニュー/サイドバー項目）まで先に定義し、UI骨格を固定する。
- 一覧の詳細機能（高度フィルタ、編集体験の磨き込み）は次フェーズで拡張する。

### ヘッダー（グローバル）
- 左: ロゴ / プロダクト名
- 中央: トップナビ（ドメイン切替）
- 右: グローバル検索、通知、ユーザーメニュー

### トップナビ
- Dashboard
- Project
- Task
- Document
- Incident
- AI
- Report
- Admin

### トップナビごとのサブメニューとサイドバー定義

#### Dashboard
- サブメニュー: `Overview`, `My Summary`
- サイドバー: 期間フィルタ、担当範囲、重要通知

#### Project
- サブメニュー: `Active`, `Archived`, `Templates`
- サイドバー: `Overview`, `Members`, `Milestones`, `Risk`, `Budget`, `AIリスク分析`

#### Task
- サブメニュー: `My Tasks`, `Backlog`, `Board`, `Gantt`
- サイドバー: ステータス、優先度、担当者、期限、関連ドキュメント、`AI提案タスク`

#### Document
- サブメニュー: `Knowledge`, `Specification`, `Design`, `SOP`, `Meeting Minutes`, `Templates`, `Archive`
- `Document > Knowledge` サイドバー:
  - カテゴリ: 開発 / インフラ / セキュリティ / 運用
  - タグ一覧
  - 最近更新
  - 未整理
  - 承認待ち
  - 自分の投稿
  - `AI推薦`

#### Incident
- サブメニュー: `Open`, `Closed`, `Postmortem`, `Root Cause`
- サイドバー: Severity、発生システム、SLA影響、再発リスク、`類似事例（AI）`

#### AI
- サブメニュー: `Ask AI`, `横断検索`, `類似インシデント分析`, `ナレッジ提案`, `自動要約/生成`, `レポート生成`
- サイドバー:
  - 検索範囲: 全体 / Documentのみ / Incidentのみ / Project単位
  - 期間フィルタ
  - 重要度
  - 技術タグ
  - 信頼度表示ON/OFF
  - 参照元表示切替

#### Report
- サブメニュー: `Progress`, `KPI`, `工数`, `SLA`, `カスタムレポート`
- サイドバー: 期間、プロジェクト、メンバー、出力形式（CSV/PDF）

#### Admin
- サブメニュー: `Users`, `Roles`, `Audit Logs`, `System Settings`
- サイドバー: 組織、権限テンプレート、アクティビティ種別

### 主要ルート
- `/dashboard`
- `/project/active` `/project/archived`
- `/task/my` `/task/backlog` `/task/board`
- `/document/knowledge` `/document/specification` `/document/design`
- `/incident/open` `/incident/closed` `/incident/postmortem`
- `/ai/ask` `/ai/search` `/ai/incident-similar`

### ルーティング補足（ナビ優先）
- URLはメニュー構造を反映する（例: `/document/knowledge/category/dev`）。
- ヘッダー選択でトップナビを切替、サブメニュー選択で第2階層へ遷移。
- サイドバーはコンテキストに応じて動的切替（カテゴリ・タグは将来DB連携）。

### 遷移方針
- トップナビ: ドメイン切替
- サブメニュー: ドメイン内カテゴリ切替
- サイドバー: フィルタ／属性／階層ナビ

## 3. データモデル（types先行）

## 共通ルール
- 先に `src/types` に型を定義してから実装する。
- 画面実装・MSWレスポンス・テストは同一型を参照する。

### 型定義（初版）
- `Task`
  - `id: string`
  - `title: string`
  - `status: "todo" | "in_progress" | "done"`
  - `priority: "low" | "medium" | "high"`
  - `assigneeId: string | null`
  - `dueDate: string | null`
  - `relatedDocumentIds: string[]`
- `Document`
  - `id: string`
  - `type: "knowledge" | "specification" | "design" | "sop" | "minutes"`
  - `title: string`
  - `category: string`
  - `tags: string[]`
  - `updatedAt: string`
- `Incident`
  - `id: string`
  - `title: string`
  - `severity: "sev1" | "sev2" | "sev3" | "sev4"`
  - `system: string`
  - `occurredAt: string`
  - `status: "open" | "closed"`
- `AiQuery`
  - `id: string`
  - `scope: "all" | "document" | "incident" | "project"`
  - `query: string`
  - `createdAt: string`
- `AiResult`
  - `id: string`
  - `answer: string`
  - `confidence: number`
  - `references: AiReference[]`
- `AiReference`
  - `type: "document" | "incident" | "task"`
  - `id: string`
  - `title: string`
  - `url: string`

## 4. API契約（MSWモック）

### エンドポイント（初版）
- `GET /api/tasks`
  - Query: `status`, `priority`, `assigneeId`, `dueFrom`, `dueTo`
  - Response: `Task[]`
- `GET /api/documents`
  - Query: `type`, `category`, `tag`, `updatedFrom`, `updatedTo`
  - Response: `Document[]`
- `GET /api/incidents`
  - Query: `status`, `severity`, `system`, `occurredFrom`, `occurredTo`
  - Response: `Incident[]`
- `POST /api/ai/search`
  - Body: `{ scope, query, filters }`
  - Response: `AiResult`
- `POST /api/ai/ask`
  - Body: `{ query, context }`
  - Response: `AiResult`

### 実装ルール
- `types` 定義 → `mocks/data` → `mocks/handlers` の順で作成。
- `MSW` ハンドラはドメイン別に分割（例: `tasks.ts`, `documents.ts`）。

## 5. 状態管理方針（Zustand）

### Zustandに置く状態
- 認証ユーザー（将来）
- グローバルUI状態（サイドバー開閉、テーマ）
- 横断フィルタ（期間、プロジェクト、重要度）
- AI検索コンテキスト（scope、直近クエリ）

### ローカルに置く状態
- 単一画面の入力中フォーム値
- 一時モーダル開閉
- 一時選択状態

### 判断基準
- 2画面以上で共有されるならZustand。
- 単画面で完結するならローカルstate。

## 6. 実装順（5タスク）

1. 型定義とMSW契約を確定
   - `src/types/*` 作成
   - `src/mocks/data/*` と `src/mocks/handlers/*` 作成
2. ルーティングとレイアウト骨組み
  - ヘッダー・トップナビ・サブメニュー・サイドバーの情報設計を実装
  - メニュー内部定義（上記一覧）を実画面に反映
3. Task / Document / Incident 一覧のMVP実装
   - 一覧表示・基本フィルタ・Loading/Error/Empty対応
4. AI画面（Ask / Search）MVP実装
   - クエリ入力、回答表示、参照元リンク表示
5. 品質仕上げ
   - Zustand整理、単体テスト、`pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:run`

## 7. 受け入れ基準（Definition of Done）

- 主要ルートが遷移可能。
- 各一覧画面で最低1つ以上のフィルタが機能。
- AI画面で `AiResult` を表示し、参照元リンクを確認できる。
- `types` と `MSW` レスポンスの型不整合がない。
- 品質ゲート4種（lint/format/typecheck/test）が通る。
