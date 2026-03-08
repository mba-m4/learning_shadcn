/**
 * テンプレート管理用 localStorage ユーティリティ
 */

import type {
  Template,
  TemplateMapping,
  TemplateStorage,
  MappingStorage,
} from '@/types/template'

// localStorageのキー定義
const STORAGE_KEYS = {
  TEMPLATES: 'document-templates',
  MAPPINGS: 'template-mappings',
} as const

// draw.ioの空ダイアグラムXML（新規テンプレート用）
export const EMPTY_DIAGRAM_XML = `<mxfile><diagram id="1" name="Page-1"><mxGraphModel dx="800" dy="450"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`

/**
 * localStorage から全テンプレートを取得
 */
export function getAllTemplates(): Template[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
    if (!data) return []
    const storage: TemplateStorage = JSON.parse(data)
    return storage.templates || []
  } catch (error) {
    console.error('Failed to load templates:', error)
    return []
  }
}

/**
 * テンプレートIDから単一のテンプレートを取得
 */
export function getTemplateById(id: string): Template | undefined {
  const templates = getAllTemplates()
  return templates.find((t) => t.id === id)
}

/**
 * 新規テンプレートを作成して保存
 */
export function createTemplate(
  template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
): Template {
  const now = new Date().toISOString()
  const newTemplate: Template = {
    ...template,
    // diagramXmlが空の場合は、空ダイアグラムXMLを設定
    diagramXml: template.diagramXml || EMPTY_DIAGRAM_XML,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  const templates = getAllTemplates()
  templates.push(newTemplate)
  saveTemplates(templates)

  return newTemplate
}

/**
 * 既存テンプレートを更新
 */
export function updateTemplate(
  id: string,
  updates: Partial<Omit<Template, 'id' | 'createdAt'>>
): Template | null {
  const templates = getAllTemplates()
  const index = templates.findIndex((t) => t.id === id)

  if (index === -1) return null

  const updatedTemplate: Template = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  templates[index] = updatedTemplate
  saveTemplates(templates)

  return updatedTemplate
}

/**
 * テンプレートを削除
 */
export function deleteTemplate(id: string): boolean {
  const templates = getAllTemplates()
  const filtered = templates.filter((t) => t.id !== id)

  if (filtered.length === templates.length) return false

  saveTemplates(filtered)

  // 関連するマッピングも削除
  const mappings = getAllMappings()
  const filteredMappings = mappings.filter((m) => m.templateId !== id)
  saveMappings(filteredMappings)

  return true
}

/**
 * テンプレート一覧を localStorage に保存
 */
function saveTemplates(templates: Template[]): void {
  try {
    const storage: TemplateStorage = { templates }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(storage))
  } catch (error) {
    console.error('Failed to save templates:', error)
    throw new Error('テンプレートの保存に失敗しました')
  }
}

/**
 * localStorage から全マッピングを取得
 */
export function getAllMappings(): TemplateMapping[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MAPPINGS)
    if (!data) return []
    const storage: MappingStorage = JSON.parse(data)
    return storage.mappings || []
  } catch (error) {
    console.error('Failed to load mappings:', error)
    return []
  }
}

/**
 * テンプレートIDに対応するマッピングを取得
 */
export function getMappingByTemplateId(
  templateId: string
): TemplateMapping | undefined {
  const mappings = getAllMappings()
  return mappings.find((m) => m.templateId === templateId)
}

/**
 * 新規マッピングを作成して保存
 */
export function createMapping(
  mapping: Omit<TemplateMapping, 'id' | 'createdAt' | 'updatedAt'>
): TemplateMapping {
  const now = new Date().toISOString()
  const newMapping: TemplateMapping = {
    ...mapping,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  const mappings = getAllMappings()
  mappings.push(newMapping)
  saveMappings(mappings)

  return newMapping
}

/**
 * 既存マッピングを更新
 */
export function updateMapping(
  id: string,
  updates: Partial<Omit<TemplateMapping, 'id' | 'createdAt'>>
): TemplateMapping | null {
  const mappings = getAllMappings()
  const index = mappings.findIndex((m) => m.id === id)

  if (index === -1) return null

  const updatedMapping: TemplateMapping = {
    ...mappings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  mappings[index] = updatedMapping
  saveMappings(mappings)

  return updatedMapping
}

/**
 * マッピングを削除
 */
export function deleteMapping(id: string): boolean {
  const mappings = getAllMappings()
  const filtered = mappings.filter((m) => m.id !== id)

  if (filtered.length === mappings.length) return false

  saveMappings(filtered)
  return true
}

/**
 * マッピング一覧を localStorage に保存
 */
function saveMappings(mappings: TemplateMapping[]): void {
  try {
    const storage: MappingStorage = { mappings }
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(storage))
  } catch (error) {
    console.error('Failed to save mappings:', error)
    throw new Error('マッピングの保存に失敗しました')
  }
}
