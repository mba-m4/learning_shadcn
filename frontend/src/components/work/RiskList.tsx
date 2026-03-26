import { Badge } from '@/components/ui/badge'
import type { RiskDisplay } from '@/types/api'
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react'

interface RiskListProps {
  risks: RiskDisplay[]
  severities?: Record<string, 'low' | 'medium' | 'high'>
}

const getSeverityIcon = (severity?: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    case 'medium':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    case 'low':
      return <Clock className="h-4 w-4 text-green-600" />
    default:
      return null
  }
}

const getSeverityBorder = (severity?: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high':
      return 'border-l-4 border-l-red-500 bg-red-50/50'
    case 'medium':
      return 'border-l-4 border-l-yellow-500 bg-yellow-50/50'
    case 'low':
      return 'border-l-4 border-l-green-500 bg-green-50/50'
    default:
      return 'border-l-4 border-l-slate-300'
  }
}

export default function RiskList({ risks, severities = {} }: RiskListProps) {
  if (risks.length === 0) {
    return <p className="text-sm text-muted-foreground">リスクは未生成です。</p>
  }

  return (
    <ul className="divide-y divide-border/40 rounded-md border border-border/40 bg-white/60 text-sm overflow-hidden">
      {risks.map((risk) => (
        <li key={risk.id} className={`px-3 py-2 ${getSeverityBorder(severities[risk.id])}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1">
              {getSeverityIcon(severities[risk.id])}
              <div className="space-y-1 flex-1">
                <p className="font-medium">{risk.content}</p>
                <p className="text-xs text-muted-foreground">{risk.timestamp}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={risk.source === 'manual' ? 'secondary' : 'outline'}>
                {risk.source === 'manual' ? '手入力' : 'AI'}
              </Badge>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
