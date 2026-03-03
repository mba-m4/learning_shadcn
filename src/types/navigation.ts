export type SidebarItem = {
  label: string
  children?: string[]
}

export type SubmenuConfig = {
  id: string
  label: string
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
