# Risk Check API ドキュメント

## 概要

工場作業前のリスク確認・共有 Web アプリケーションのバックエンド API。

- **Base URL**: `http://localhost:8000`
- **認証方式**: JWT Bearer Token
- **API 仕様**: OpenAPI 3.1.0 ([openapi.json](./openapi.json))

## 認証

### ログイン

```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=leader&password=leaderpass
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 認証が必要なリクエスト

```http
Authorization: Bearer <access_token>
```

**認証不要**: `/auth/login` のみ

### デフォルトユーザー

| login_id | password    | role            |
|----------|-------------|-----------------|
| leader   | leaderpass  | leader          |
| worker   | workerpass  | worker          |
| safety   | safetypass  | safety_manager  |

### 現在のユーザー情報取得

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "name": "Leader",
  "role": "leader",
  "is_active": true
}
```

## 作業グループ

### 作業グループ作成

```http
POST /works/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "設備点検"
}
```

**権限**: leader のみ

**Response:**
```json
{
  "id": 1,
  "name": "設備点検"
}
```

### 作業グループ一覧

```http
GET /works/groups
```

**認証**: 必要

**Response:**
```json
[
  {
    "id": 1,
    "name": "設備点検"
  }
]
```

## 作業

### 作業作成

```http
POST /works
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "配管点検",
  "description": "配管の目視点検",
  "group_id": 1,
  "work_date": "2026-02-11",
  "status": "draft"
}
```

**権限**: leader のみ

**Response:**
```json
{
  "id": 1,
  "title": "配管点検",
  "description": "配管の目視点検",
  "group_id": 1,
  "work_date": "2026-02-11",
  "status": "draft"
}
```

### 当日作業一覧

```http
GET /works/daily?work_date=2026-02-11
```

**認証**: 必要

**Response:**
```json
[
  {
    "work": {
      "id": 1,
      "title": "配管点検",
      "description": "配管の目視点検",
      "group_id": 1,
      "work_date": "2026-02-11",
      "status": "confirmed"
    },
    "items": [
      {
        "item": {
          "id": 1,
          "work_id": 1,
          "name": "バルブ確認",
          "description": "締結状態の確認"
        },
        "risks": [
          {
            "id": 1,
            "work_item_id": 1,
            "content": "AI suggested risk for work item 1. Review and confirm before work.",
            "generated_at": "2026-02-11T04:07:13.477033"
          }
        ]
      }
    ]
  }
]
```

### 作業詳細

```http
GET /works/{work_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "work": {
    "id": 1,
    "title": "配管点検",
    "description": "配管の目視点検",
    "group_id": 1,
    "work_date": "2026-02-11",
    "status": "confirmed"
  },
  "items": [
    {
      "item": {
        "id": 1,
        "work_id": 1,
        "name": "バルブ確認",
        "description": "締結状態の確認"
      },
      "risks": [
        {
          "id": 1,
          "work_item_id": 1,
          "content": "AI suggested risk for work item 1. Review and confirm before work.",
          "generated_at": "2026-02-11T04:07:13.477033"
        }
      ]
    }
  ]
}
```

### 全件ビュー（ページング）

```http
GET /works?start_date=2026-02-01&end_date=2026-03-31&limit=20&offset=0
Authorization: Bearer <token>
```

**検索拡張（任意）**
```http
GET /works?start_date=2026-02-01&end_date=2026-03-31&limit=20&offset=0&group_id=1&q=配管
Authorization: Bearer <token>
```

**Response:**
```json
{
  "items": [
    {
      "work": {
        "id": 1,
        "title": "配管点検",
        "description": "配管の目視点検",
        "group_id": 1,
        "work_date": "2026-02-11",
        "status": "confirmed"
      },
      "items": [
        {
          "id": 1,
          "work_id": 1,
          "name": "バルブ確認",
          "description": "締結状態の確認"
        }
      ],
      "risk_count": 2
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### 作業日サマリー（カレンダー用）

```http
GET /works/dates?start_date=2026-02-01&end_date=2026-03-31
Authorization: Bearer <token>
```

**Response:**
```json
[
  { "work_date": "2026-02-11", "count": 3 },
  { "work_date": "2026-02-12", "count": 1 }
]
```

### ストリーム取得（任意）

```http
GET /works/stream?start_date=2026-02-01&end_date=2026-03-31
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "work_date": "2026-02-11",
    "items": [
      {
        "work": {
          "id": 1,
          "title": "配管点検",
          "description": "配管の目視点検",
          "group_id": 1,
          "work_date": "2026-02-11",
          "status": "confirmed"
        },
        "items": [
          {
            "id": 1,
            "work_id": 1,
            "name": "バルブ確認",
            "description": "締結状態の確認"
          }
        ],
        "risk_count": 2
      }
    ]
  }
]
```

## 作業内容

### 作業内容追加

```http
POST /works/{work_id}/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "バルブ確認",
  "description": "締結状態の確認"
}
```

**権限**: leader のみ

**Response:**
```json
{
  "id": 1,
  "work_id": 1,
  "name": "バルブ確認",
  "description": "締結状態の確認"
}
```

## リスク評価

### リスク生成

```http
POST /works/items/{work_item_id}/risks/generate
Authorization: Bearer <token>
```

**権限**: leader のみ

**Response:**
```json
{
  "id": 1,
  "work_item_id": 1,
  "content": "AI suggested risk for work item 1. Review and confirm before work.",
  "generated_at": "2026-02-11T04:07:13.477033"
}
```

### 手入力リスク

```http
GET /works/items/{work_item_id}/risks/manual
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "work_item_id": 1,
    "content": "足元のコードに注意",
    "created_at": "2026-02-11T04:10:13.477033"
  }
]
```

```http
POST /works/items/{work_item_id}/risks/manual
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "足元のコードに注意"
}
```

**Response:**
```json
{
  "id": 1,
  "work_item_id": 1,
  "content": "足元のコードに注意",
  "created_at": "2026-02-11T04:10:13.477033"
}
```

### 全体リスク判定

```http
GET /works/{work_id}/risk-summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "work_id": 1,
  "level": "medium",
  "score": 60,
  "reasons": ["足元のコードに注意"],
  "updated_at": "2026-02-11T04:10:13.477033"
}
```

## コメント

### コメント追加

```http
POST /works/{work_id}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "当日確認しました"
}
```

**権限**: worker, leader（safety_manager は不可）

**Response:**
```json
{
  "id": 1,
  "work_id": 1,
  "user_id": 1,
  "content": "当日確認しました",
  "created_at": "2026-02-11T04:07:13.486023"
}
```

### コメント一覧

```http
GET /works/{work_id}/comments
Authorization: Bearer <token>
```

**認証**: 必要

**Response:**
```json
[
  {
    "id": 1,
    "work_id": 1,
    "user_id": 1,
    "content": "当日確認しました",
    "created_at": "2026-02-11T04:07:13.486023"
  }
]
```

## エラーレスポンス

### 401 Unauthorized

```json
{
  "code": "401",
  "message": "Invalid credentials"
}
```

### 403 Forbidden

```json
{
  "code": "403",
  "message": "Not allowed"
}
```

### 422 Validation Error

```json
{
  "code": "validation_error",
  "message": "Validation error",
  "details": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Swagger UI

開発中は以下で API を試せます:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## フロントエンド実装時の注意点

1. **認証フロー**:
   - ログイン → トークン取得
   - トークンを localStorage などに保存
   - API リクエスト時に `Authorization: Bearer <token>` ヘッダーを付与

2. **権限制御**:
   - leader: 全操作可能
   - worker: コメント追加のみ可能
   - safety_manager: 閲覧のみ

3. **日付フォーマット**:
  - `work_date`: `YYYY-MM-DD` 形式（JST想定）
   - `created_at`, `generated_at`: ISO 8601 形式（UTC）

4. **CORS**:
  - ローカル開発向けに `localhost:5173/3000` を許可済み
