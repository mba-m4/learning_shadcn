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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="space-y-3">
        <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          React Query + MSW + Router + Zustand
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Basic CRUD template playground
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          一覧取得だけでなく、詳細、作成、編集、削除、画面状態の保持、faker
          と @mswjs/data を使った教材向けモック設計まで一通り試せるテンプレートです。
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Documents flow</CardTitle>
            <CardDescription>
              React Query の query / mutation 定義を直接使う CRUD サンプルです。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              一覧ページから検索・並び順・詳細遷移・削除確認まで試せます。作成と編集は共通フォームで、詳細画面には faker 生成の owner、tags、status なども表示します。
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
            <CardTitle>Projects relation</CardTitle>
            <CardDescription>
              Documents が属する project を別 resource として扱うサンプルです。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              `@mswjs/data` の relation を使って、project detail から related documents を確認できます。document 作成・編集時には project の選択も行えます。
            </p>
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              to="/projects"
            >
              Projects を開く
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
              ドキュメント本体は MSW モック API を通じて取得・更新され、seed データは faker と @mswjs/data で構築されています。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
