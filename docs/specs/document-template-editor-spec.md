# Document Template Editor 機能仕様書

## 1. 概要

draw.io を活用したドキュメントテンプレート作成・管理機能。
プレースホルダーを使用してDB情報からドキュメントを生成できるシステム。

## 2. 画面構成

### 2.1 URL
`http://localhost:5173/document/templates`

### 2.2 レイアウト
3カラムレイアウト

```
┌─────────────────────────────────────────────────┐
│  Header (WorkspaceShell)                        │
├──────────┬────────────────────────┬─────────────┤
│          │                        │             │
│  左SB    │   draw.io エディタ      │   右SB      │
│          │    (iframe)            │             │
│ テンプレ │                        │  DB選択     │
│ 一覧     │                        │  カラム一覧 │
│          │                        │  マッピング │
│          │                        │             │
└──────────┴────────────────────────┴─────────────┘
```

## 3. 機能要件

### 3.1 左サイドバー（テンプレート管理）

#### 機能
- テンプレート一覧表示
- テンプレート選択
- 新規テンプレート作成
- テンプレート削除

#### UI要素
- **「+ 新規テンプレート」ボタン**
- **テンプレート一覧**
  - テンプレート名
  - 作成日時
  - 最終更新日時
  - 選択状態表示

#### データ構造
```typescript
interface Template {
  id: string
  name: string
  description?: string
  diagramXml: string // draw.io XML
  createdAt: string
  updatedAt: string
}
```

### 3.2 中央エリア（draw.io エディタ）

#### 機能
- draw.io の iframe 埋め込み
- 図の作成・編集
- 保存機能
- エクスポート機能（将来）

#### 実装詳細
- URL: `https://embed.diagrams.net/`
- パラメータ:
  - `embed=1`: 埋め込みモード
  - `ui=min`: 最小UI
  - `spin=1`: 起動時のスピナー表示
  - `proto=json`: メッセージプロトコル
- postMessage API で通信

#### 操作
- **保存ボタン**: XMLをlocalStorageに保存
- **エクスポートボタン**（将来）: SVG/PNG/XML等の形式選択

### 3.3 右サイドバー（DB連携・プレースホルダー管理）

#### 3.3.1 DBテーブル選択
- **ドロップダウン**: 利用可能なDB一覧
- 選択時に該当テーブルのカラム一覧を表示

#### 3.3.2 カラム一覧表示
- テーブル名
- カラム名一覧
  - カラム名
  - データ型
  - 説明（あれば）

#### 3.3.3 プレースホルダー管理
- **「+ プレースホルダー追加」ボタン**
- **マッピング一覧**
  - プレースホルダー名: `{{placeholder_name}}`
  - 対応DBカラム: `table.column`
  - 削除ボタン

#### データ構造
```typescript
interface TemplateMapping {
  id: string
  templateId: string
  dbTable: string
  placeholders: PlaceholderMapping[]
  createdAt: string
  updatedAt: string
}

interface PlaceholderMapping {
  name: string // プレースホルダー名（例: "customer_name"）
  dbColumn: string // DBカラム（例: "customers.name"）
  description?: string
}

interface DbTable {
  name: string
  description?: string
  columns: DbColumn[]
}

interface DbColumn {
  name: string
  type: string // "string" | "number" | "date" | "boolean" 等
  description?: string
}
```

## 4. データ永続化

### 4.1 localStorage 構造

```typescript
// キー: "document-templates"
{
  templates: Template[]
}

// キー: "template-mappings"
{
  mappings: TemplateMapping[]
}
```

### 4.2 保存場所
- 実装: `src/lib/storage/templates.ts`
- 型定義: `src/types/template.ts`

### 4.3 MSW モックデータ
- DB定義: `src/mocks/data/databases.ts`
- サンプルテーブル:
  - `customers`: id, name, email, phone, created_at
  - `orders`: id, customer_id, order_date, total_amount, status
  - `products`: id, name, price, stock, category
  - `invoices`: id, order_id, invoice_date, due_date, amount

## 5. ユーザーフロー

### 5.1 新規テンプレート作成フロー
1. 「+ 新規テンプレート」ボタンクリック
2. テンプレート名入力ダイアログ表示
3. 名前入力後、空のテンプレート作成
4. draw.io エディタで図を作成
5. 「保存」ボタンで localStorage に保存
6. 左サイドバーのテンプレート一覧に追加表示

### 5.2 プレースホルダー設定フロー
1. 右サイドバーでDBテーブル選択
2. カラム一覧が表示される
3. 「+ プレースホルダー追加」ボタンクリック
4. プレースホルダー名とDBカラムを設定
5. マッピング情報を localStorage に保存
6. draw.io 上でプレースホルダー使用可能（例: `{{customer_name}}`）

### 5.3 テンプレート編集フロー
1. 左サイドバーでテンプレート選択
2. draw.io エディタにXMLロード
3. 右サイドバーに保存済みマッピング表示
4. 編集後「保存」で更新

### 5.4 ドキュメント生成フロー（将来実装）
1. テンプレート選択
2. データソース（DBレコード）選択
3. プレースホルダーに実データ差し込み
4. PDF/SVG等でエクスポート

## 6. 技術スタック

### 6.1 コンポーネント構成
```
src/
├── components/
│   ├── layout/
│   │   ├── left-sidebar.tsx      # 汎用左サイドバー
│   │   └── right-sidebar.tsx     # 汎用右サイドバー
│   └── template-editor/
│       ├── template-list.tsx     # テンプレート一覧
│       ├── drawio-editor.tsx     # draw.io iframe
│       ├── db-selector.tsx       # DBテーブル選択
│       ├── column-list.tsx       # カラム一覧
│       └── placeholder-manager.tsx # プレースホルダー管理
├── pages/
│   └── document-template-page.tsx # メインページ
├── lib/
│   └── storage/
│       └── templates.ts          # localStorage操作
├── types/
│   └── template.ts               # 型定義
└── mocks/
    └── data/
        └── databases.ts          # DBモックデータ
```

### 6.2 使用ライブラリ
- **draw.io**: `https://embed.diagrams.net/`
- **状態管理**: Zustand（グローバル状態が必要な場合）
- **shadcn/ui**: Button, Input, Select, ScrollArea, Card, Dialog, Separator

## 7. 実装優先順位

### Phase 1（基本機能）
1. ✅ 仕様書作成
2. 型定義作成
3. localStorage ユーティリティ実装
4. 左サイドバーコンポーネント（汎用）
5. 右サイドバーコンポーネント（汎用）
6. テンプレート一覧・作成・削除
7. draw.io iframe 埋め込み・保存

### Phase 2（DB連携）
8. MSW モックデータ作成
9. DB選択・カラム一覧表示
10. プレースホルダー管理UI

### Phase 3（データ生成）
11. プレースホルダー差し込み機能
12. エクスポート機能（SVG/XML）

## 8. 制約事項

- テンプレートデータは localStorage に保存（サイズ制限あり）
- draw.io の機能は iframe のため制限される部分あり
- プレースホルダーの検証は手動（draw.io 内での自動補完は不可）

## 9. 将来拡張

- テンプレートのバージョン管理
- テンプレートの共有機能
- リアルタイムプレビュー
- バッチ生成機能
- クラウドストレージ連携
