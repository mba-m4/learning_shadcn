/**
 * draw.io エディタコンポーネント
 * iframe で embed.diagrams.net を埋め込み、postMessage APIで通信
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Template } from '@/types/template'
import { updateTemplate } from '@/lib/storage/templates'

interface DrawioEditorProps {
  /** 編集するテンプレート */
  template: Template | null
  /** 保存完了時のコールバック */
  onSave?: (template: Template) => void
}

export function DrawioEditor({ template, onSave }: DrawioEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentXml, setCurrentXml] = useState<string>('')
  const [isReady, setIsReady] = useState(false)

  /**
   * draw.io にXMLをロード
   */
  const loadXml = useCallback((xml: string) => {
    if (!iframeRef.current?.contentWindow) return

    const message = {
      action: 'load',
      xml: xml,
      autosave: 1,
    }

    iframeRef.current.contentWindow.postMessage(
      JSON.stringify(message),
      '*'
    )
  }, [])

  /**
   * draw.io から現在のXMLをエクスポート
   */
  const exportXml = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return

    const message = {
      action: 'export',
      format: 'xml',
    }

    iframeRef.current.contentWindow.postMessage(
      JSON.stringify(message),
      '*'
    )
  }, [])

  // テンプレートが変更された時の処理
  useEffect(() => {
    if (template && isReady) {
      setIsLoading(true)
      if (template.diagramXml) {
        setTimeout(() => {
          loadXml(template.diagramXml)
          setIsLoading(false)
        }, 300)
      } else {
        setIsLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id, isReady, loadXml])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // draw.io からのメッセージのみ処理
      if (event.data === 'ready') {
        console.log('draw.io loaded and ready')
        setIsReady(true)
        setIsLoading(false)
      }

      // draw.io からのエクスポート結果を受信
      if (typeof event.data === 'string' && event.data.startsWith('export:')) {
        const xml = event.data.substring(7) // "export:" を除去
        setCurrentXml(xml)
        console.log('XML exported, length:', xml.length)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  /**
   * テンプレートを保存
   */
  const handleSave = async () => {
    if (!template) return

    setIsSaving(true)

    // 保存前に最新のXMLをエクスポート
    exportXml()

    // エクスポート完了を待つ
    setTimeout(() => {
      // エクスポートされたXMLを使用、なければ現在のXMLまたはテンプレートのXMLを使用
      const xmlToSave = currentXml || template.diagramXml

      if (!xmlToSave) {
        console.warn('No XML to save')
        setIsSaving(false)
        return
      }

      const updated = updateTemplate(template.id, {
        diagramXml: xmlToSave,
      })

      setIsSaving(false)

      if (updated && onSave) {
        onSave(updated)
        console.log('Template saved successfully')
      }
    }, 1500) // エクスポート完了を待つため少し長めに設定
  }

  if (!template) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        テンプレートを選択してください
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* ツールバー */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div>
          <h2 className="text-sm font-semibold">{template.name}</h2>
          {template.description && (
            <p className="text-xs text-muted-foreground">
              {template.description}
            </p>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              保存
            </>
          )}
        </Button>
      </div>

      {/* draw.io エディタ */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&configure=1"
          className="size-full border-0"
          title="draw.io editor"
        />
      </div>
    </div>
  )
}
