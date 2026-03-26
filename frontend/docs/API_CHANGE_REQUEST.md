# API 仕様変更依頼書

本書はフロント側の仕様変更に伴う API 追加・拡張の依頼一覧です。

## 共通
- 認証: Authorization: Bearer {access_token}
- 日付形式: YYYY-MM-DD（JST）
- ページング: limit / offset / total
- エラー: { code, message, details? }

## 必須

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

### 全件ビュー（ページング）
- GET /works?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=20&offset=0
  - Response: { items: [{ work, items, risk_count }], total, limit, offset }

### 作業日サマリー（カレンダー用）
- GET /works/dates?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
  - Response: [{ work_date, count }]

## 任意（拡張）

### サーバ側検索
- GET /works?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=20&offset=0&group_id=1&q=keyword
  - Response: { items: [{ work, items, risk_count }], total, limit, offset }

### ストリーム取得
- GET /works/stream?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
  - Response: [{ work_date, items: [{ work, items, risk_count }] }]
