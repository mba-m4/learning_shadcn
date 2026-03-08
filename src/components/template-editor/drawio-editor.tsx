/**
 * draw.io エディタコンポーネント
 * embed.diagrams.net を postMessage(JSON) で制御する
 */

import { useEffect, useRef, useState } from 'react'
import { Save, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty'
import type { Template } from '@/types/template'
import { updateTemplate, EMPTY_DIAGRAM_XML } from '@/lib/storage/templates'

interface DrawioEditorProps {
  template: Template | null
  onSave?: (template: Template) => void
}

export function DrawioEditor({ template, onSave }: DrawioEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasLoadedRef = useRef(false)
  const [isReady, setIsReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedRecently, setSavedRecently] = useState(false)
  const [currentXml, setCurrentXml] = useState<string>(template?.diagramXml ?? '')

  useEffect(() => {
    if (!template) return

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      if (typeof event.data !== 'string') return

      let message: { event?: string; xml?: string } | null = null

      try {
        message = JSON.parse(event.data)
      } catch {
        if (event.data === 'ready') {
          message = { event: 'ready' }
        } else {
          return
        }
      }

      const eventName = message?.event
      if (!eventName) return

      if ((eventName === 'ready' || eventName === 'init') && !hasLoadedRef.current) {
        hasLoadedRef.current = true
        setIsReady(true)

        const xmlToLoad = template.diagramXml || EMPTY_DIAGRAM_XML
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            action: 'load',
            autosave: 1,
            saveAndExit: 1,
            xml: xmlToLoad,
          }),
          '*'
        )
        return
      }

      if (eventName === 'autosave' || eventName === 'save') {
        const xml = message?.xml
        if (xml) {
          setCurrentXml(xml)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [template])

  const handleSave = () => {
    if (!template) return

    setIsSaving(true)
    const xmlToSave = currentXml || template.diagramXml || EMPTY_DIAGRAM_XML

    const updated = updateTemplate(template.id, {
      diagramXml: xmlToSave,
    })

    setIsSaving(false)

    if (updated) {
      setSavedRecently(true)
      setTimeout(() => setSavedRecently(false), 2000)
      
      if (onSave) {
        onSave(updated)
      }
    }
  }

  if (!template) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title="テンプレートを選択してください"
          description="左の一覧からテンプレートを選ぶと、ここで編集できます"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div>
          <h2 className="text-sm font-semibold">{template.name}</h2>
          {template.description && (
            <p className="text-xs text-muted-foreground">{template.description}</p>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving || !isReady} variant={savedRecently ? 'default' : 'default'}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              保存中...
            </>
          ) : savedRecently ? (
            <>
              <Check className="mr-2 size-4" />
              保存しました
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              保存
            </>
          )}
        </Button>
      </div>

      <div className="relative flex-1">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="https://embed.diagrams.net/?embed=1&proto=json&ui=min&libraries=1&spin=0&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
          className="size-full border-0"
          title="draw.io editor"
          allow="fullscreen"
        />
      </div>
    </div>
  )
}
