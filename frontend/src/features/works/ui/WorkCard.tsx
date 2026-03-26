import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Work } from '@/types/api'

interface WorkCardProps {
  work: Work
  groupName?: string
}

const statusLabel: Record<Work['status'], string> = {
  draft: '下書き',
  confirmed: '確定',
}

export default function WorkCard({
  work,
  groupName,
}: WorkCardProps) {
  return (
    <Link to={`/works/${work.id}`} className="group">
      <div className="rounded-xl border border-border bg-card shadow-sm flex h-full flex-col gap-4 px-6 py-5 transition-all duration-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
              Task
            </p>
            <h3 className="mt-2 text-lg font-semibold leading-tight text-foreground">
              {work.title}
            </h3>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground/60 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{work.description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="holo-tag">作業日: {work.work_date}</span>
          <span className="holo-tag">グループ: {groupName ?? `#${work.group_id}`}</span>
          <Badge variant="secondary">{statusLabel[work.status]}</Badge>
        </div>
      </div>
    </Link>
  )
}
