# GitHub MCP 設定

このプロジェクトでは GitHub MCP サーバーを使用して、GitHub の操作を効率化します。

## セットアップ手順

### 1. GitHub Personal Access Token の取得

1. GitHub にログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" をクリック
4. 以下のスコープを選択:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership, read org projects)
5. トークンを生成してコピー

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を追加:

```env
GITHUB_TOKEN=your_github_token_here
```

### 3. MCP サーバーの確認

`.vscode/mcp.json` に以下の設定が含まれていることを確認:

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### 4. VSCode の再起動

設定完了後、VSCode を再起動すると GitHub MCP が有効になります。

## 利用可能な機能

- リポジトリの検索
- Issue の作成・管理
- Pull Request の作成・管理
- コミット履歴の取得
- ブランチの作成・管理

## トラブルシューティング

### MCP サーバーが起動しない場合

1. `GITHUB_TOKEN` が正しく設定されているか確認
2. トークンのスコープが正しいか確認
3. VSCode の出力パネルで MCP のログを確認
