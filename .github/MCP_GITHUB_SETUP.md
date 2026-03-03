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

### 2. 環境変数の設定（MCP 用）

`GitHub MCP` は VS Code の MCP サーバープロセスで動作するため、
`.env.local` ではなく **OS 環境変数**として `GITHUB_TOKEN` を設定する。

#### 方法A: zsh 設定ファイルに追加（推奨）

`~/.zshrc` に以下を追加:

```bash
export GITHUB_TOKEN="your_github_token_here"
```

反映:

```bash
source ~/.zshrc
```

#### 方法B: launchctl で GUI アプリ向けに設定（macOS）

```bash
launchctl setenv GITHUB_TOKEN "your_github_token_here"
```

その後、VS Code を再起動する。

> 補足: `.env.local` は Vite アプリ実行時の環境変数用であり、MCP サーバー用ではない。

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

確認コマンド:

```bash
echo ${GITHUB_TOKEN:+set}
```

`set` と表示されれば設定済み。

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
