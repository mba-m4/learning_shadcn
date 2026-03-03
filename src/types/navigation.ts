import type { LucideIcon } from 'lucide-react'

export type SidebarItem = {
  label: string
  children?: string[]
}

export type SubmenuConfig = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  path: string
  sidebarItems: SidebarItem[]
}

export type TopNavConfig = {
  id: string
  label: string
  basePath: string
  submenus: SubmenuConfig[]
}

export type NavigationContext = {
  topNav: TopNavConfig
  submenu: SubmenuConfig
}
