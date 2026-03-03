import { Button } from '@/components/ui/button'

type ErrorFallbackProps = {
  error: Error
  reset?: () => void
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <div className="text-center">
        <h2 className="mb-2 text-lg font-semibold text-destructive">
          エラーが発生しました
        </h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      {reset && (
        <Button onClick={reset} variant="outline">
          再試行
        </Button>
      )}
    </div>
  )
}
