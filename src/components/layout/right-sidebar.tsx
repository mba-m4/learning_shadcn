/**
 * 汎用右サイドバーコンポーネント
 * メニュー内容を引数で受け取り、様々なページで再利用可能
 */

import { type ReactNode } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface RightSidebarProps {
  /** サイドバーの内容 */
  children: ReactNode
  /** カスタムクラス名 */
  className?: string
  /** 幅（デフォルト: 280px） */
  width?: string | number
  /** 背景色を変更するか（デフォルト: true） */
  withBackground?: boolean
}

/**
 * 右サイドバーコンポーネント
 * 
 * 使用例:
 * ```tsx
 * <RightSidebar width={320}>
 *   <div className="p-4">
 *     <h2>設定</h2>
 *     <div>内容</div>
 *   </div>
 * </RightSidebar>
 * ```
 */
export function RightSidebar({
  children,
  className,
  width = 280,
  withBackground = true,
}: RightSidebarProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width

  return (
    <aside
      className={cn(
        'flex-shrink-0 border-l',
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
