import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  itemName: string
  risk: string
  action: string
  onOpenChange(open: boolean): void
}

export function RiskActionPreviewDialog({
  open,
  itemName,
  risk,
  action,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Risk / Action</DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Risk
            </p>
            <p className="mt-2 whitespace-pre-wrap text-slate-900">{risk}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Action
            </p>
            <p className="mt-2 whitespace-pre-wrap text-slate-900">{action}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}