import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Box, CheckCircle2, LoaderCircle, MapPinOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/shared/api/client'
import { getWorkSceneAnnotationColor, getWorkSceneAnnotationLabel, sortWorkSceneAnnotations } from '@/features/works/model/workScene'
import { WorkSceneCanvas } from '@/features/works/ui/WorkSceneCanvas'
import type { WorkSceneAnnotation, WorkSceneAsset } from '@/types/api'

interface Props {
  error: unknown
  isLoading: boolean
  sceneAsset: WorkSceneAsset | null
  onRefetch(): void
}

export function WorkSceneSection({ error, isLoading, sceneAsset, onRefetch }: Props) {
  const sortedAnnotations = useMemo(
    () => sortWorkSceneAnnotations(sceneAsset?.annotations ?? []),
    [sceneAsset],
  )
  const positionedAnnotations = useMemo(
    () => sortedAnnotations.filter((annotation) => annotation.position),
    [sortedAnnotations],
  )
  const positionedSceneAsset = useMemo(() => {
    if (!sceneAsset) {
      return null
    }

    return {
      ...sceneAsset,
      annotations: positionedAnnotations,
    }
  }, [sceneAsset, positionedAnnotations])
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
    sortedAnnotations[0]?.id ?? null,
  )

  useEffect(() => {
    setSelectedAnnotationId((currentId) => {
      if (!sortedAnnotations.length) {
        return null
      }

      if (currentId && sortedAnnotations.some((annotation) => annotation.id === currentId)) {
        return currentId
      }

      return sortedAnnotations[0].id
    })
  }, [sortedAnnotations])

  const selectedAnnotation =
    sortedAnnotations.find((annotation) => annotation.id === selectedAnnotationId) ??
    sortedAnnotations[0] ??
    null

  const handleSelectAnnotation = (annotation: WorkSceneAnnotation) => {
    setSelectedAnnotationId(annotation.id)
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm">
      <div className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.10),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(239,68,68,0.12),_transparent_40%)] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              3D Scene
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold">
              <Box className="h-5 w-5 text-primary" />
              作業モデルとイベントレイヤー
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              座標があるものだけを 3D に重ね、未設定のものは一覧で灰色表示します。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
              リスク
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
              作業
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.5)]" />
              位置未設定
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center rounded-2xl border border-border/60 bg-slate-50 text-sm text-muted-foreground">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              3D モデルを読み込み中...
            </div>
          ) : error ? (
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>{getErrorMessage(error)}</p>
              <Button variant="outline" onClick={onRefetch}>
                再試行
              </Button>
            </div>
          ) : positionedSceneAsset ? (
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-w-[280px] flex-col gap-2">
                <div className="rounded-2xl border border-white/30 bg-slate-950/45 px-4 py-3 text-xs text-white shadow-lg backdrop-blur-md">
                  <p className="font-semibold text-white/95">{positionedSceneAsset.model_name}</p>
                  <p className="mt-1 text-white/75">座標系: {positionedSceneAsset.coordinate_system}</p>
                </div>
                {selectedAnnotation && (
                  <div className="rounded-2xl border border-white/30 bg-slate-950/45 px-4 py-3 text-xs text-white shadow-lg backdrop-blur-md">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      Selected Event
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: selectedAnnotation.position
                            ? getWorkSceneAnnotationColor(selectedAnnotation)
                            : '#94a3b8',
                          boxShadow: `0 0 12px ${selectedAnnotation.position
                            ? getWorkSceneAnnotationColor(selectedAnnotation)
                            : '#94a3b8'}`,
                        }}
                      />
                      <p className="truncate font-semibold text-white/95">{selectedAnnotation.title}</p>
                    </div>
                  </div>
                )}
              </div>
              <WorkSceneCanvas
                sceneAsset={positionedSceneAsset}
                selectedAnnotationId={selectedAnnotation?.id ?? null}
                onSelectAnnotation={handleSelectAnnotation}
              />
            </div>
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-2xl border border-border/60 bg-slate-50 text-sm text-muted-foreground">
              モデルデータがありません。
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-white">
            <div className="border-b border-border/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Layer Items
                  </p>
                  <h3 className="mt-2 text-base font-semibold">座標付きイベント一覧</h3>
                </div>
                <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {positionedAnnotations.length} / {sortedAnnotations.length} positioned
                </span>
              </div>
            </div>
            <div className="max-h-[420px] space-y-2 overflow-y-auto p-3">
              {sortedAnnotations.map((annotation) => {
                const isSelected = annotation.id === selectedAnnotation?.id
                const tone = annotation.position ? getWorkSceneAnnotationColor(annotation) : '#94a3b8'
                return (
                  <button
                    key={annotation.id}
                    type="button"
                    onClick={() => handleSelectAnnotation(annotation)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-border/60 bg-slate-50/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: tone, boxShadow: `0 0 12px ${tone}` }}
                          />
                          <span className="text-xs font-semibold text-muted-foreground">
                            {annotation.position ? getWorkSceneAnnotationLabel(annotation) : '位置未設定'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{annotation.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{annotation.description}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    {annotation.position ? (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        ({annotation.position.x.toFixed(2)}, {annotation.position.y.toFixed(2)}, {annotation.position.z.toFixed(2)})
                      </p>
                    ) : (
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPinOff className="h-3 w-3" />
                        3D 座標が未設定です
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}