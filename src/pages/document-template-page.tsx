/**
 * ドキュメントテンプレートエディタページ
 * 3カラムレイアウト: テンプレート一覧 | draw.io エディタ | DB連携設定
 */

import { useState } from 'react'
import { LeftSidebar } from '@/components/layout/left-sidebar'
import { RightSidebar } from '@/components/layout/right-sidebar'
import { TemplateList } from '@/components/template-editor/template-list'
import { DrawioEditor } from '@/components/template-editor/drawio-editor'
import type { Template } from '@/types/template'

export function DocumentTemplatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
  }

  const handleSaveTemplate = (template: Template) => {
    setSelectedTemplate(template)
    // TODO: 成功通知を表示
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* 左サイドバー: テンプレート一覧 */}
      <LeftSidebar width={280}>
        <TemplateList
          selectedTemplateId={selectedTemplate?.id}
          onSelectTemplate={handleSelectTemplate}
        />
      </LeftSidebar>

      {/* 中央エリア: draw.io エディタ */}
      <main className="flex-1">
        <DrawioEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
        />
      </main>

      {/* 右サイドバー: DB選択・プレースホルダー管理 */}
      <RightSidebar width={320}>
        <div className="p-4">
          <h2 className="mb-4 text-sm font-semibold">DB連携設定</h2>
          <div className="text-sm text-muted-foreground">
            {selectedTemplate ? (
              <div>
                <p className="mb-2">テンプレート: {selectedTemplate.name}</p>
                <p className="text-xs">
                  プレースホルダー管理機能は次のフェーズで実装されます
                </p>
              </div>
            ) : (
              <p>テンプレートを選択してください</p>
            )}
          </div>
        </div>
      </RightSidebar>
    </div>
  )
}
