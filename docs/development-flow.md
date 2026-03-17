# Documents CRUD Development Flow

この手順書は、このリポジトリで新しい画面や機能を追加するときの基本フローを初心者向けにまとめたものです。

## まず結論

今のこのプロジェクトでは、だいたい次の順で進めると迷いにくいです。

1. 何を作るか決める
2. ページを追加する
3. ルートを追加する
4. 共有型を `src/types` に追加する
5. API 契約用の Zod schema を `src/schema` に追加する
6. API 関数を `src/api` に追加する
7. MSW ハンドラーを `src/mocks` に追加する
8. TanStack Query の query / mutation 定義を `src/queries` に追加する
9. UI 状態が必要なら Zustand の store を `src/store` に追加する
10. ページで `useQuery` / `useMutation` / TanStack Form を使って画面を完成させる
11. `pnpm typecheck` と `pnpm lint` で確認する

## 役割の整理

- `src/pages`
  - 画面本体を置く
- `src/routers`
  - 画面に URL を割り当てる
- `src/types`
  - 共有する基本型を置く
- `src/schema`
  - Zod の schema を置く
- `src/api`
  - HTTP リクエスト関数を置く
- `src/mocks`
  - MSW のモック API を置く
- `src/queries`
  - TanStack Query の query / mutation 定義を置く
- `src/store`
  - Zustand の UI 状態を置く
- `src/components`
  - 再利用する UI 部品を置く

## なぜこの順なのか

ページだけ先に作ると、何が足りないかが見えやすいからです。

たとえば `Sample` ページを最初に作ってルートへつなぐと、

- どんなデータが必要か
- どんな URL が必要か
- どの状態を画面だけで持つか
- API が必要か

が先に見えます。

そのあとで `types`、`schema`、`api`、`queries` を足すと、必要なものだけを増やせます。

## 実際の最小フロー

### 1. ページを作る

まずは Hello World でよいです。

例: `src/pages/sample/SamplePage.tsx`

```tsx
export function SamplePage() {
  return <h1>Sample</h1>
}
```

### 2. ルートを追加する

今のルーターは [src/routers/router.tsx](../src/routers/router.tsx) です。

```tsx
<Route path="sample">
  <Route index element={<SamplePage />} />
</Route>
```

これでまず URL で画面が開ける状態にします。

### 3. 共有型を作る

複数ファイルから使う型は `src/types` に追加します。

例: `src/types/sample.ts`

```ts
export type SampleItem = {
  id: string
  title: string
}
```

## 4. Zod schema を作る

API の入力や出力を validate したいので、`src/schema` に Zod schema を置きます。

例: `src/schema/sample.ts`

```ts
import { z } from "zod"

export const sampleItemSchema = z.object({
  id: z.string(),
  title: z.string(),
})

export const sampleItemsSchema = z.array(sampleItemSchema)
```

このプロジェクトでは、共有型は `src/types` から参照し、Zod schema 自体は `src/schema` に置く方針です。

### 5. API 関数を作る

HTTP リクエストは `src/api` に置きます。

このプロジェクトでは、`/api` の prefix は [src/api/client.ts](../src/api/client.ts) の `baseURL` で吸収します。各 API ファイルではドメイン部分だけを書きます。

必要なら path 文字列は [src/api/paths.ts](../src/api/paths.ts) にまとめます。

例: `src/api/sample.ts`

```ts
import { api } from "@/api/client"
import { sampleApiPaths } from "@/api/paths"
import { sampleItemsSchema } from "@/schema/sample"
import type { SampleItem } from "@/types/sample"

export const fetchSampleItems = async (): Promise<SampleItem[]> => {
  const res = await api.get(sampleApiPaths.list)
  return sampleItemsSchema.parse(res.data)
}
```

### 6. MSW モックを作る

バックエンドがまだなくても画面開発が進められるように、`src/mocks/handlers.ts` にハンドラーを足します。

MSW は axios の `baseURL` を共有しないので、モック側では `/api` を含んだ path を使います。今のプロジェクトでは [src/api/paths.ts](../src/api/paths.ts) に API 用 path と MSW 用 path をまとめています。

```ts
http.get(sampleMockPaths.list, () => {
  return HttpResponse.json([
    { id: "1", title: "sample 1" },
    { id: "2", title: "sample 2" },
  ])
})
```

### 7. TanStack Query の定義を作る

API をそのままページで叩かず、query 定義を `src/queries` に切り出します。

```ts
import { queryOptions } from "@tanstack/react-query"
import { fetchSampleItems } from "@/api/sample"

export default function createSampleQueryOptions() {
  return queryOptions({
    queryKey: ["sample"],
    queryFn: fetchSampleItems,
  })
}
```

### 8. ページで useQuery を使う

画面側では `useQuery(createSampleQueryOptions())` を呼びます。

```tsx
const { data, isLoading, error } = useQuery(createSampleQueryOptions())
```

このプロジェクトでは、query を定義する関数と `useQuery` を呼ぶ場所を分けています。

### 9. UI 状態が必要なら Zustand を使う

検索キーワード、並び順、タブ状態のように、サーバーの正本データではないものは Zustand で持ちます。

今の実例は [src/store/useDocumentsUiStore.ts](../src/store/useDocumentsUiStore.ts) です。

このルールが重要です。

- サーバー状態: TanStack Query
- フォーム状態: TanStack Form
- 画面共有 UI 状態: Zustand
- その場限りの軽い状態: 必要なら `useState`

### 10. 作成・編集フォームは TanStack Form を使う

今の documents フォームは [src/components/documents/DocumentForm.tsx](../src/components/documents/DocumentForm.tsx) で TanStack Form を使っています。

```tsx
const form = useForm({
  defaultValues: initialValues,
  onSubmit: async ({ value }) => {
    await onSubmit(value)
  },
})
```

ページ側ではフォーム値を `useState` で持たず、送信処理だけ渡します。

```tsx
<DocumentForm
  initialValues={defaultDocumentValues}
  onSubmit={handleSubmit}
  ...
/>
```

## documents 機能の実例

このリポジトリの documents 機能は、次の流れでできています。

1. 型
   - [src/types/documents.ts](../src/types/documents.ts)
2. schema
   - [src/schema/documents.ts](../src/schema/documents.ts)
3. API
   - [src/api/documents.ts](../src/api/documents.ts)
  - [src/api/paths.ts](../src/api/paths.ts)
4. mocks
   - [src/mocks/handlers.ts](../src/mocks/handlers.ts)
5. queries
   - [src/queries/documents/createDocumentsQueryOptions.ts](../src/queries/documents/createDocumentsQueryOptions.ts)
   - [src/queries/documents/createDocumentDetailQueryOptions.ts](../src/queries/documents/createDocumentDetailQueryOptions.ts)
   - [src/queries/documents/createDocumentCreateMutationOptions.ts](../src/queries/documents/createDocumentCreateMutationOptions.ts)
6. store
   - [src/store/useDocumentsUiStore.ts](../src/store/useDocumentsUiStore.ts)
7. pages
  - [src/pages/documents/DocumentsPage.tsx](../src/pages/documents/DocumentsPage.tsx)
  - [src/pages/documents/DocumentDetailPage.tsx](../src/pages/documents/DocumentDetailPage.tsx)
  - [src/pages/documents/DocumentCreatePage.tsx](../src/pages/documents/DocumentCreatePage.tsx)
  - [src/pages/documents/DocumentEditPage.tsx](../src/pages/documents/DocumentEditPage.tsx)

## 初心者向けの判断基準

迷ったら次の質問で切り分けてください。

### これは API から来るデータか？

- Yes → TanStack Query
- No → 次へ

### これは複数画面や複数コンポーネントで共有したい UI 状態か？

- Yes → Zustand
- No → 次へ

### これはフォーム入力中の値か？

- Yes → TanStack Form
- No → 次へ

### これはその場限りの一時状態か？

- Yes → `useState`

## よくあるミス

- API の戻り型を `types` に書いたのに、schema 側を直し忘れる
- query 定義を作らず、ページごとに `useQuery({ ... })` を手書きして key がぶれる
- サーバーデータを Zustand に入れて React Query と二重管理する
- フォーム値をグローバル store に入れて必要以上に複雑にする

## 開発時の確認コマンド

```bash
pnpm dev
pnpm typecheck
pnpm lint
```

## このプロジェクトで今後揃えたいルール

- 型は `src/types`
- Zod schema は `src/schema`
- API 関数は `src/api`
- query / mutation 定義は `src/queries`
- 共有 UI 状態は `src/store`
- ページは `src/pages`
