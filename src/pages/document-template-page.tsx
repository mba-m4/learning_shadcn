/**
 * ドキュメントテンプレートエディタページ
 * 3カラム: テンプレート一覧 | draw.io | DB連携設定
 * shadcn/ui Sidebarコンポーネントを使用
 */

import { useMemo, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar'
import { TemplateList } from '@/components/template-editor/template-list'
import { DrawioEditor } from '@/components/template-editor/drawio-editor'
import { DbSelector } from '@/components/template-editor/db-selector'
import { ColumnList } from '@/components/template-editor/column-list'
import { PlaceholderManager } from '@/components/template-editor/placeholder-manager'
import { mockDatabaseTables, getTableByName } from '@/mocks/data/databases'
import {
  getTemplateById,
  getMappingByTemplateId,
  createMapping,
  updateMapping,
} from '@/lib/storage/templates'
import type { PlaceholderMapping, Template } from '@/types/template'

export function DocumentTemplatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTableName, setSelectedTableName] = useState('')
  const [placeholders, setPlaceholders] = useState<PlaceholderMapping[]>([])

  const selectedTable = useMemo(
    () => getTableByName(selectedTableName),
    [selectedTableName]
  )

  const handleSelectTemplate = (template: Template) => {
    const latestTemplate = getTemplateById(template.id) ?? template
    setSelectedTemplate(latestTemplate)

    const mapping = getMappingByTemplateId(latestTemplate.id)
    setSelectedTableName(mapping?.dbTable ?? '')
    setPlaceholders(mapping?.placeholders ?? [])
  }

  const persistMapping = (
    templateId: string,
    dbTable: string,
    nextPlaceholders: PlaceholderMapping[]
  ) => {
    const existing = getMappingByTemplateId(templateId)

    if (existing) {
      updateMapping(existing.id, {
        dbTable,
        placeholders: nextPlaceholders,
      })
      return
    }

    createMapping({
      templateId,
      dbTable,
      placeholders: nextPlaceholders,
    })
  }

  const handleChangeTable = (tableName: string) => {
    setSelectedTableName(tableName)

    if (!selectedTemplate) return

    persistMapping(selectedTemplate.id, tableName, placeholders)
  }

  const handleChangePlaceholders = (nextPlaceholders: PlaceholderMapping[]) => {
    setPlaceholders(nextPlaceholders)

    if (!selectedTemplate || !selectedTableName) return

    persistMapping(selectedTemplate.id, selectedTableName, nextPlaceholders)
  }

  const handleSaveTemplate = (template: Template) => {
    const latestTemplate = getTemplateById(template.id)
    if (latestTemplate) {
      setSelectedTemplate(latestTemplate)
    }
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <>
      <Sidebar side="left" collapsible="none">
        <SidebarContent>
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold">テンプレート</h2>
          </div>
          <Separator />
          <TemplateList
            key={refreshKey}
            selectedTemplateId={selectedTemplate?.id}
            onSelectTemplate={handleSelectTemplate}
          />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <DrawioEditor
          key={selectedTemplate?.id || 'no-template'}
          template={selectedTemplate}
          onSave={handleSaveTemplate}
        />
      </SidebarInset>

      <Sidebar side="right" collapsible="none">
        <SidebarContent>
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold">DB連携設定</h2>
          </div>
          <Separator />
          <div className="space-y-4 p-4">
            <DbSelector
              tables={mockDatabaseTables}
              selectedTableName={selectedTableName}
              onSelectTable={handleChangeTable}
              disabled={!selectedTemplate}
            />

            <ColumnList table={selectedTable} />

            <PlaceholderManager
              dbTable={selectedTableName}
              columns={selectedTable?.columns ?? []}
              placeholders={placeholders}
              onChange={handleChangePlaceholders}
              disabled={!selectedTemplate}
            />
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  )
}
