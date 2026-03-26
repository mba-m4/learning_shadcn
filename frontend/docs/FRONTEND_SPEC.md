# リスクチェック フロントエンド仕様書

## 目的
工場作業前のリスク確認・共有を、役割に応じて迷わず操作できるUIで提供する。リーダーは作業グループ・作業・作業項目の作成とリスク生成を行い、作業者は内容確認とコメント投稿を行う。安全管理者は閲覧のみを行う。

## ゴール
- 日付指定で当日作業の全体像を素早く把握できる。
- ログインとセッション復元を簡潔にする。
- 権限に応じた操作制御を明確にする。
- UIの構成要素は shadcn/ui で統一する。
- 状態管理は zustand を使用する。

## 非ゴール
- ユーザー管理（作成・削除）
- オフライン対応
- 多言語対応

## 役割と権限
- leader: 作成・更新・リスク生成・コメント
- worker: 閲覧とコメントのみ
- safety_manager: 閲覧のみ

## 主要ユーザーフロー
1. ログイン
   - ユーザー名/パスワード送信
   - トークン保存
   - ユーザー情報取得
2. 日次一覧（デフォルト）
   - 日付選択
   - 作業とリスクの一覧表示
3. リーダー: 作業グループ作成
4. リーダー: 作業作成
   - グループ選択
   - タイトル/説明/日付/ステータス入力
   - 作業項目追加
5. リーダー: リスク生成
   - 作業項目ごとに生成実行
6. 作業者/リーダー: 手入力リスク
  - 作業項目に対して手入力リスクを追加
7. 作業者/リーダー: コメント
   - 作業詳細とコメント確認
   - コメント投稿

## 情報設計
- 認証
  - ログイン
- メイン
  - 日次一覧
  - 全件ビュー（カレンダー + 表）
  - 作業詳細
  - 作業グループ管理（leader）
  - 作業作成（leader）

## 画面一覧
1. ログイン
2. 日次一覧
3. 全件ビュー
  - カレンダーで作業日を把握
  - 表形式で作業と作業項目を確認
  - 詳細検索（グループ/作業名）
4. 作業詳細
  - 全体リスク判定の表示
  - 手入力リスクの追加
5. 作業グループ管理（leader）
6. 作業作成（leader）
7. 権限不足

## API対応表
Base URL: http://localhost:8000

- POST /auth/login -> ログイン
- GET /auth/me -> セッション復元
- GET /works/daily?work_date=YYYY-MM-DD -> 日次一覧
- GET /works/groups -> 作業グループ一覧
- POST /works/groups -> 作業グループ作成（leader）
- POST /works -> 作業作成（leader）
- POST /works/{work_id}/items -> 作業項目追加（leader）
- POST /works/items/{work_item_id}/risks/generate -> リスク生成（leader）
- GET /works/{work_id}/comments -> コメント一覧
- POST /works/{work_id}/comments -> コメント追加（leader/worker）

## UX要件
- 日付は本日を初期値とする。
- ヘッダーに役割バッジを表示する。
- 権限外の操作は無効化し、ツールチップで理由を示す。
- 成功/失敗はトーストで通知する。
- リスク生成など負荷が高い操作は確認ダイアログを挟む。
- 全件ビューの詳細検索はアコーディオンで折りたたむ。

## データモデル（フロント）
- User: { id, name, role, is_active }
- WorkGroup: { id, name }
- Work: { id, title, description, group_id, work_date, status }
- WorkItem: { id, work_id, name, description }
- Risk: { id, work_item_id, content, generated_at }
- WorkOverview: { work, items: { item, risks[] }[] }
- Comment: { id, work_id, user_id, content, created_at }

## 状態管理（zustand）
- authStore
  - accessToken
  - currentUser
  - login, logout, restoreSession
- workStore
  - date
  - dailyOverview
  - groups
  - selectedWork
  - fetchDailyOverview, fetchGroups, createGroup
- workEditorStore（leader）
  - draftWork
  - workItemsDraft
  - createWork, addWorkItem
- commentStore
  - commentsByWorkId
  - fetchComments, addComment

## ルーティング
- /login
- / （日次一覧）
- /works （全件ビュー）
- /works/:workId （作業詳細）
- /groups （作業グループ管理）
- /works/new （作業作成）

## ディレクトリ構成（案）
- src/
  - app/
    - App.tsx
    - routes.tsx
    - providers.tsx
  - pages/
    - LoginPage.tsx
    - DailyOverviewPage.tsx
    - WorkDetailPage.tsx
    - GroupsPage.tsx
    - WorkCreatePage.tsx
    - NotAuthorizedPage.tsx
  - components/
    - layout/
      - AppShell.tsx
      - PageHeader.tsx
    - work/
      - WorkCard.tsx
      - WorkItemList.tsx
      - RiskList.tsx
    - comments/
      - CommentList.tsx
      - CommentForm.tsx
  - lib/
    - api/
      - client.ts
      - auth.ts
      - works.ts
      - comments.ts
    - auth/
      - guards.tsx
    - hooks/
      - useAuth.ts
  - stores/
    - authStore.ts
    - workStore.ts
    - workEditorStore.ts
    - commentStore.ts
  - styles/
    - globals.css
  - types/
    - api.ts

## 使用する shadcn/ui コンポーネント
- Button, Input, Label, Card, Badge, Tabs, Dialog, Sheet
- Select, Popover, Calendar, Tooltip
- Textarea, Separator, Skeleton, Toast
 - Table, Accordion

## エラーハンドリング
- 401: /login に遷移しトークンを破棄
- 403: 権限不足画面を表示
- 422: 入力エラーを表示しトースト通知
- ネットワークエラー: リトライ導線を表示

## セキュリティ
- トークンはメモリ + localStorage に保存して復元
- 認証が必要な API は Authorization ヘッダーを付与
- トークンはログ出力しない

## 制約
- shadcn/ui のコンポーネントファイルは直接編集しない
- shadcn CLI で追加・更新する
- 画面は shadcn/ui コンポーネントの合成で構築する

## 追加したライブラリと機能
- react-router-dom: ルーティング
- zustand: クライアント状態管理
- sonner: トースト通知（shadcn/ui の sonner コンポーネント）
- react-day-picker: カレンダー表示
- date-fns: 日付処理
- next-themes: shadcn/ui の依存（テーマ切替は未使用）
- shadcn/ui 追加コンポーネント: accordion, calendar, table

## 環境変数
- VITE_API_BASE_URL: API ベース URL（未設定時は http://localhost:8000）

## バックエンド追加API案
手入力リスクと全体判定は別エンドポイントで取得する前提です。

### 全件ビュー（ページング）
- GET /works?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=20&offset=0
  - Response: { items: [{ work, items, risk_count }], total, limit, offset }

### 作業日サマリー（カレンダー用）
- GET /works/dates?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
  - Response: [{ work_date, count }]

### 作業詳細
- GET /works/{work_id}
  - Response: { work, items: [{ item, risks: [] }] }

### 手入力リスク
- GET /works/items/{work_item_id}/risks/manual
  - Response: [{ id, work_item_id, content, created_at }]
- POST /works/items/{work_item_id}/risks/manual
  - Body: { content }
  - Response: { id, work_item_id, content, created_at }

### 全体リスク判定
- GET /works/{work_id}/risk-summary
  - Response: { work_id, level, score, reasons?, updated_at? }
  - level: low | medium | high
