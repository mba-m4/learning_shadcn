/**
 * データベース構造のモックデータ
 * テンプレートエディタでプレースホルダー設定時に使用
 */

import type { DbTable } from '@/types/template'

/**
 * 利用可能なデータベーステーブル一覧
 */
export const mockDatabaseTables: DbTable[] = [
  {
    name: 'customers',
    description: '顧客情報テーブル',
    columns: [
      {
        name: 'id',
        type: 'number',
        description: '顧客ID',
        nullable: false,
      },
      {
        name: 'name',
        type: 'string',
        description: '顧客名',
        nullable: false,
      },
      {
        name: 'email',
        type: 'string',
        description: 'メールアドレス',
        nullable: false,
      },
      {
        name: 'phone',
        type: 'string',
        description: '電話番号',
        nullable: true,
      },
      {
        name: 'company',
        type: 'string',
        description: '会社名',
        nullable: true,
      },
      {
        name: 'address',
        type: 'string',
        description: '住所',
        nullable: true,
      },
      {
        name: 'created_at',
        type: 'date',
        description: '登録日時',
        nullable: false,
      },
    ],
  },
  {
    name: 'orders',
    description: '注文情報テーブル',
    columns: [
      {
        name: 'id',
        type: 'number',
        description: '注文ID',
        nullable: false,
      },
      {
        name: 'customer_id',
        type: 'number',
        description: '顧客ID',
        nullable: false,
      },
      {
        name: 'order_number',
        type: 'string',
        description: '注文番号',
        nullable: false,
      },
      {
        name: 'order_date',
        type: 'date',
        description: '注文日',
        nullable: false,
      },
      {
        name: 'total_amount',
        type: 'number',
        description: '合計金額',
        nullable: false,
      },
      {
        name: 'status',
        type: 'string',
        description: 'ステータス（pending/processing/completed/cancelled）',
        nullable: false,
      },
      {
        name: 'delivery_date',
        type: 'date',
        description: '配送予定日',
        nullable: true,
      },
    ],
  },
  {
    name: 'products',
    description: '商品情報テーブル',
    columns: [
      {
        name: 'id',
        type: 'number',
        description: '商品ID',
        nullable: false,
      },
      {
        name: 'name',
        type: 'string',
        description: '商品名',
        nullable: false,
      },
      {
        name: 'description',
        type: 'string',
        description: '商品説明',
        nullable: true,
      },
      {
        name: 'price',
        type: 'number',
        description: '価格',
        nullable: false,
      },
      {
        name: 'stock',
        type: 'number',
        description: '在庫数',
        nullable: false,
      },
      {
        name: 'category',
        type: 'string',
        description: 'カテゴリ',
        nullable: false,
      },
      {
        name: 'sku',
        type: 'string',
        description: 'SKUコード',
        nullable: false,
      },
      {
        name: 'is_active',
        type: 'boolean',
        description: '販売中フラグ',
        nullable: false,
      },
    ],
  },
  {
    name: 'invoices',
    description: '請求書情報テーブル',
    columns: [
      {
        name: 'id',
        type: 'number',
        description: '請求書ID',
        nullable: false,
      },
      {
        name: 'order_id',
        type: 'number',
        description: '注文ID',
        nullable: false,
      },
      {
        name: 'invoice_number',
        type: 'string',
        description: '請求書番号',
        nullable: false,
      },
      {
        name: 'invoice_date',
        type: 'date',
        description: '請求日',
        nullable: false,
      },
      {
        name: 'due_date',
        type: 'date',
        description: '支払期限',
        nullable: false,
      },
      {
        name: 'amount',
        type: 'number',
        description: '請求金額',
        nullable: false,
      },
      {
        name: 'tax_amount',
        type: 'number',
        description: '税額',
        nullable: false,
      },
      {
        name: 'status',
        type: 'string',
        description: 'ステータス（unpaid/paid/overdue）',
        nullable: false,
      },
      {
        name: 'notes',
        type: 'string',
        description: '備考',
        nullable: true,
      },
    ],
  },
]

/**
 * テーブル名から DbTable を取得
 */
export function getTableByName(tableName: string): DbTable | undefined {
  return mockDatabaseTables.find((table) => table.name === tableName)
}

/**
 * すべてのテーブル名を取得
 */
export function getAllTableNames(): string[] {
  return mockDatabaseTables.map((table) => table.name)
}
