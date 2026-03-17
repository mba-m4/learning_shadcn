import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <section className="space-y-3">
        <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          React Query + MSW + Router + Zustand
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Basic CRUD template playground
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          一覧取得だけでなく、詳細、作成、編集、削除、画面状態の保持まで一通り試せるテンプレートです。
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents flow</CardTitle>
            <CardDescription>
              React Query の query / mutation 定義を直接使う CRUD サンプルです。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              一覧ページから検索・並び順・詳細遷移・削除確認まで試せます。作成と編集は共通フォームです。
            </p>
            <Link
              className={cn(buttonVariants({ variant: "default" }))}
              to="/documents"
            >
              Documents を開く
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>State separation</CardTitle>
            <CardDescription>
              サーバー状態は React Query、UI 状態は Zustand に分けています。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              検索キーワードと並び順は Zustand
              に保存され、一覧へ戻っても保持されます。
            </p>
            <p>
              ドキュメント本体は MSW モック API を通じて取得・更新されます。
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
