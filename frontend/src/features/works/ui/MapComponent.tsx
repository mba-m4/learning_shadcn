import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { WorkLocationData, LocationMarker } from '@/shared/types/location'

interface MapComponentProps {
  data: WorkLocationData
}

interface PopupState {
  marker: LocationMarker
  position: { x: number; y: number }
}

export default function MapComponent({ data }: MapComponentProps) {
  const [popup, setPopup] = useState<PopupState | null>(null)
  const [scale, setScale] = useState(1)

  // マーカーデータを構築
  const markers: LocationMarker[] = [
    {
      id: data.work.id,
      type: 'work',
      title: data.work.title,
      location: data.work.location.coordinates,
      color: '#22c55e', // green
    },
    ...data.risks.map((risk) => ({
      id: risk.id,
      type: 'risk' as const,
      title: risk.title,
      location: risk.location,
      severity: risk.severity,
      color:
        risk.severity === 'high'
          ? '#ef4444' // red
          : risk.severity === 'medium'
            ? '#eab308' // yellow
            : '#84cc16', // lime
      description: risk.description,
    })),
  ]

  const handleMarkerClick = (marker: LocationMarker, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPopup({
      marker,
      position: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    })
  }

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'high':
        return '高リスク'
      case 'medium':
        return '注意'
      case 'low':
        return '軽微'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* ズームコントロール */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
        >
          −
        </Button>
        <span className="text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setScale(Math.min(2, scale + 0.2))}
        >
          ＋
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setScale(1)}
        >
          リセット
        </Button>
      </div>

      {/* マップコンテナ */}
      <div className="relative overflow-auto rounded-xl border border-border/60 bg-slate-50">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-out',
          }}
          className="relative inline-block"
        >
          {/* マップ画像 or フォールバック背景 */}
          <svg
            width="800"
            height="600"
            className="block bg-gradient-to-br from-slate-100 to-slate-200"
          >
            <defs>
              <pattern
                id="gridPattern"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#gridPattern)" />
            <text
              x="400"
              y="300"
              textAnchor="middle"
              fill="#94a3b8"
              className="text-sm font-semibold"
              fontSize="16"
            >
              Factory Floor Plan
            </text>
            {/* エリア表示 */}
            <rect
              x={data.work.location.coordinates.x - (data.work.location.coordinates.width ?? 50) / 2}
              y={data.work.location.coordinates.y - (data.work.location.coordinates.height ?? 50) / 2}
              width={data.work.location.coordinates.width ?? 50}
              height={data.work.location.coordinates.height ?? 50}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="5,5"
              rx="4"
            />
            <text
              x={data.work.location.coordinates.x}
              y={data.work.location.coordinates.y - (data.work.location.coordinates.height ?? 50) / 2 - 10}
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontWeight="600"
            >
              {data.work.location.name}
            </text>
          </svg>

          {/* マーカーレイヤー */}
          {markers.map((marker) => (
            <div
              key={marker.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${marker.location.x}px`,
                top: `${marker.location.y}px`,
              }}
              onClick={(e) => handleMarkerClick(marker, e as any)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMarkerClick(marker, e as any)
              }}
            >
              {/* マーカーサークル */}
              <div
                className="flex items-center justify-center rounded-full border-2 border-white shadow-lg transition hover:scale-125"
                style={{
                  width: marker.type === 'work' ? '32px' : '24px',
                  height: marker.type === 'work' ? '32px' : '24px',
                  backgroundColor: marker.color || '#3b82f6',
                }}
              >
                <span className="text-[10px] font-bold text-white">
                  {marker.type === 'work' ? '〇' : '!'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ポップアップ */}
        {popup && (
          <div
            className="absolute z-50 rounded-lg border border-border/60 bg-white shadow-xl"
            style={{
              left: `${popup.position.x + 20}px`,
              top: `${popup.position.y + 20}px`,
            }}
          >
            <div className="flex items-start justify-between border-b border-border/60 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {popup.marker.title}
                </p>
                {popup.marker.type === 'risk' && popup.marker.severity && (
                  <p
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        popup.marker.color || '#3b82f6',
                    }}
                  >
                    {getSeverityLabel(popup.marker.severity)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPopup(null)}
                className="text-muted-foreground hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {popup.marker.description && (
              <p className="p-3 text-xs text-muted-foreground">
                {popup.marker.description}
              </p>
            )}
            <div className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
              {popup.marker.type === 'work' ? '作業場所' : 'リスク発生箇所'}
              <br />
              座標: ({popup.marker.location.x}, {popup.marker.location.y})
            </div>
          </div>
        )}
      </div>

      {/* レジェンド */}
      <div className="rounded-lg border border-border/60 bg-slate-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Legend
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span>作業位置</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <span>高リスク</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-yellow-400" />
            <span>注意</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-lime-500" />
            <span>軽微</span>
          </div>
        </div>
      </div>
    </div>
  )
}
