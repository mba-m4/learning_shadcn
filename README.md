# rky_app

バックエンドとフロントエンドを同一リポジトリで管理する構成です。

## 構成

- backend/: FastAPI バックエンド
- frontend/: Vite + React フロントエンド

## 開発環境

### バックエンド

```bash
cd backend
uv sync
uv run python main.py
```

Makefile を使う場合は、`make` 経由で起動できます。利用可能なターゲットは `make help` で確認してください。

- デフォルトポート: 8000

### フロントエンド

```bash
cd frontend
pnpm install
pnpm dev
```

- デフォルトポート: 5173

## 環境変数

フロントエンドは `VITE_API_BASE_URL` を参照します。未設定時は `http://localhost:8000` を使用します。

必要に応じて `frontend/.env` に設定してください。

## よくある調整

- フロントのポートを変えた場合は、バックエンドの CORS 設定を更新してください。
