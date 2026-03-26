import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotAuthorizedPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="holo-panel w-full max-w-2xl px-8 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Access Denied
        </p>
        <h1 className="mt-3 text-2xl font-semibold">権限がありません</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          このページを表示する権限がありません。ロールを確認してください。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/">日次一覧に戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
