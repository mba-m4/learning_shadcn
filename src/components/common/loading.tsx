export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function LoadingFallback({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
      <LoadingSpinner />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
