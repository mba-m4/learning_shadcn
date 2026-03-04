/**
 * 汎用左サイドバーコンポーネント
 * メニュー内容を引数で受け取り、様々なページで再利用可能
 */

import { type ReactNode } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface LeftSidebarProps {
  /** サイドバーの内容 */
  children: ReactNode
  /** カスタムクラス名 */
  className?: string
  /** 幅（デフォルト: 240px） */
  width?: string | number
  /** 背景色を変更するか（デフォルト: true） */
  withBackground?: boolean
}

/**
 * 左サイドバーコンポーネント
 * 
 * 使用例:
 * ```tsx
 * <LeftSidebar width={280}>
 *   <div className="p-4">
 *     <h2>メニュー</h2>
 *     <ul>
 *       <li>項目1</li>
 *       <li>項目2</li>
 *     </ul>
 *   </div>
 * </LeftSidebar>
 * ```
 */
export function LeftSidebar({
  children,
  className,
  width = 240,
  withBackground = true,
}: LeftSidebarProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width

  return (
    <aside
      className={cn(
        'flex-shrink-0 border-r',
        withBackground && 'bg-muted/30',
        className
      )}
      style={{ width: widthStyle }}
    >
      <ScrollArea className="h-full">
        {children}
      </ScrollArea>
    </aside>
  )
}
