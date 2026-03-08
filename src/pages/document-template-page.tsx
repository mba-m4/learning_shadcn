/**
 * ドキュメントテンプレートエディタページ
 * 3カラムレイアウト: テンプレート一覧 | draw.io | DB連携設定
 */

import { useState } from 'react'
import { CardContent, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { TemplateList } from '@/components/template-editor/template-list'
import { DrawioEditor } from '@/components/template-editor/drawio-editor'
import { DbSelector } from '@/components/template-editor/db-selector'
import { ColumnList } from '@/components/template-editor/column-list'
import { PlaceholderManager } from '@/components/template-editor/placeholder-manager'
import { useDatabaseTablesQuery, useDatabaseTableQuery } from '@/api/databases'
import {
  getTemplateById,
  getMappingByTemplateId,
  createMapping,
  updateMapping,
} from '@/lib/storage/templates'
import type { PlaceholderMapping, Template } from '@/types/template'
import { LoadingSpinner } from '@/components/common/loading'
import { ErrorFallback } from '@/components/common/error'

export function DocumentTemplatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTableName, setSelectedTableName] = useState('')
  const [placeholders, setPlaceholders] = useState<PlaceholderMapping[]>([])

  // TanStack Query でデータベーステーブルを取得
  const { data: mockDatabaseTables, isLoading, error } = useDatabaseTablesQuery()
  const { data: selectedTable } = useDatabaseTableQuery(selectedTableName)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback error={error} />
  if (!mockDatabaseTables) return null

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
    <SidebarProvider>
      {/* 左サイドバー: テンプレート一覧 */}
      <Sidebar side="left" collapsible="none">
        <SidebarContent>
          <div className="px-4 py-3">
            <CardTitle className="text-sm font-semibold">テンプレート</CardTitle>
          </div>
          <Separator />
          <CardContent className="p-0">
            <TemplateList
              key={refreshKey}
              selectedTemplateId={selectedTemplate?.id}
              onSelectTemplate={handleSelectTemplate}
            />
          </CardContent>
        </SidebarContent>
      </Sidebar>

      {/* メイン: エディタ */}
      <SidebarInset>
        <DrawioEditor
          key={selectedTemplate?.id || 'no-template'}
          template={selectedTemplate}
          onSave={handleSaveTemplate}
        />
      </SidebarInset>

      {/* 右サイドバー: DB連携設定 */}
      <Sidebar side="right" collapsible="none">
        <SidebarContent>
          <div className="px-4 py-3">
            <CardTitle className="text-sm font-semibold">DB連携設定</CardTitle>
          </div>
          <Separator />
          <CardContent className="space-y-4 p-4">
            <DbSelector
              tables={mockDatabaseTables}
              selectedTableName={selectedTableName}
              onSelectTable={handleChangeTable}
              disabled={!selectedTemplate}
            />

            <ColumnList table={selectedTable ?? undefined} />

            <PlaceholderManager
              dbTable={selectedTableName}
              columns={selectedTable?.columns ?? []}
              placeholders={placeholders}
              onChange={handleChangePlaceholders}
              disabled={!selectedTemplate}
            />
          </CardContent>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
