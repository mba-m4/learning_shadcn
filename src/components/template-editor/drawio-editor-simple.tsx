/**
 * draw.io エディタコンポーネント（シンプル版）
 * まずは普通にdraw.ioを表示する
 */

import { useEffect, useRef } from 'react'
import type { Template } from '@/types/template'

interface DrawioEditorProps {
  /** 編集するテンプレート */
  template: Template | null
  /** 保存完了時のコールバック */
  onSave?: (template: Template) => void
}

export function DrawioEditor({ template }: DrawioEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasLoadedRef = useRef(false)

  const EMPTY_XML =
    '<mxfile host="embed.diagrams.net" modified="2026-03-04T00:00:00.000Z" agent="Mozilla/5.0" version="24.9.10" type="device"><diagram id="page-1" name="Page-1"><mxGraphModel dx="1194" dy="673" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>'

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return

      if (typeof event.data !== 'string') return

      let message: { event?: string } | null = null

      try {
        message = JSON.parse(event.data)
      } catch {
        if (event.data === 'ready') {
          message = { event: 'ready' }
        } else {
          return
        }
      }

      if (!message?.event) return

      if ((message.event === 'init' || message.event === 'ready') && !hasLoadedRef.current) {
        hasLoadedRef.current = true
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            action: 'load',
            autosave: 1,
            saveAndExit: 1,
            xml: EMPTY_XML,
          }),
          '*'
        )
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [EMPTY_XML])

  // テンプレートなしでも表示する
  const title = template ? template.name : 'draw.io エディタ'

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="border-b bg-background px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {template?.description && (
          <p className="text-xs text-muted-foreground">{template.description}</p>
        )}
      </div>

      {/* draw.io エディタ（フルUI版） */}
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          src="https://embed.diagrams.net/?embed=1&proto=json&ui=kennedy&libraries=1&spin=0&saveAndExit=1&noExitBtn=0"
          className="size-full border-0"
          title="draw.io editor"
          allow="fullscreen"
        />
      </div>
    </div>
  )
}
