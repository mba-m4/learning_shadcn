/**
 * テンプレート管理関連の型定義
 */

/**
 * ドキュメントテンプレート
 */
export interface Template {
  /** テンプレートID（UUID） */
  id: string
  /** テンプレート名 */
  name: string
  /** 説明 */
  description?: string
  /** draw.io の XML データ */
  diagramXml: string
  /** 作成日時（ISO 8601形式） */
  createdAt: string
  /** 最終更新日時（ISO 8601形式） */
  updatedAt: string
}

/**
 * テンプレートとDBのマッピング情報
 */
export interface TemplateMapping {
  /** マッピングID（UUID） */
  id: string
  /** 対応するテンプレートID */
  templateId: string
  /** 使用するDBテーブル名 */
  dbTable: string
  /** プレースホルダーとDBカラムのマッピング一覧 */
  placeholders: PlaceholderMapping[]
  /** 作成日時（ISO 8601形式） */
  createdAt: string
  /** 最終更新日時（ISO 8601形式） */
  updatedAt: string
}

/**
 * プレースホルダーとDBカラムのマッピング
 */
export interface PlaceholderMapping {
  /** プレースホルダー名（例: "customer_name"） */
  name: string
  /** DBカラム（例: "customers.name"） */
  dbColumn: string
  /** 説明 */
  description?: string
}

/**
 * データベーステーブル定義
 */
export interface DbTable {
  /** テーブル名 */
  name: string
  /** 説明 */
  description?: string
  /** カラム一覧 */
  columns: DbColumn[]
}

/**
 * データベースカラム定義
 */
export interface DbColumn {
  /** カラム名 */
  name: string
  /** データ型 */
  type: 'string' | 'number' | 'date' | 'boolean' | 'json'
  /** 説明 */
  description?: string
  /** NULL許可 */
  nullable?: boolean
}

/**
 * localStorage に保存するテンプレートデータ構造
 */
export interface TemplateStorage {
  /** テンプレート一覧 */
  templates: Template[]
}

/**
 * localStorage に保存するマッピングデータ構造
 */
export interface MappingStorage {
  /** マッピング一覧 */
  mappings: TemplateMapping[]
}
