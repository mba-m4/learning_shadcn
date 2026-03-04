/**
 * draw.io エディタコンポーネント
 * iframe で embed.diagrams.net を埋め込み、postMessage APIで通信
 */

import { useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    if (!template) return

    // テンプレートが変更されたら、draw.io にロード
    setCurrentXml(template.diagramXml)
    setIsLoading(true)
  }, [template?.id])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // draw.io からのメッセージのみ処理
      if (event.data === 'ready') {
        console.log('draw.io loaded')
        setIsLoading(false)
      }

      // draw.io が初期化完了したらXMLをロード
      if (event.data === 'ready' && template) {
        if (template.diagramXml) {
          // 既存のXMLをロード
          setTimeout(() => {
            loadXml(template.diagramXml)
          }, 500)
        }
      }

      // draw.io からのエクスポート結果を受信
      if (typeof event.data === 'string' && event.data.startsWith('export:')) {
        const xml = event.data.substring(7) // "export:" を除去
        setCurrentXml(xml)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [template])

  /**
   * draw.io にXMLをロード
   */
  const loadXml = (xml: string) => {
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
  }

  /**
   * draw.io から現在のXMLをエクスポート
   */
  const exportXml = () => {
    if (!iframeRef.current?.contentWindow) return

    const message = {
      action: 'export',
      format: 'xml',
    }

    iframeRef.current.contentWindow.postMessage(
      JSON.stringify(message),
      '*'
    )
  }

  /**
   * テンプレートを保存
   */
  const handleSave = async () => {
    if (!template) return

    setIsSaving(true)

    // 最新のXMLをエクスポート
    exportXml()

    // エクスポート完了を待つ（簡易実装）
    setTimeout(() => {
      const updated = updateTemplate(template.id, {
        diagramXml: currentXml || template.diagramXml,
      })

      setIsSaving(false)

      if (updated && onSave) {
        onSave(updated)
      }
    }, 1000)
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
