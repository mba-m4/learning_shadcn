type EmptyStateProps = {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  title = 'データがありません',
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <div>
        <h3 className="mb-1 text-base font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
