import type { NavigationContext, SubmenuConfig, TopNavConfig } from '@/types/navigation'

function matchTopNav(pathname: string, navigationConfig: TopNavConfig[]): TopNavConfig {
  return (
    navigationConfig.find(
      (topNav) =>
        pathname === topNav.basePath || pathname.startsWith(`${topNav.basePath}/`)
    ) ?? navigationConfig[0]
  )
}

function matchSubmenu(pathname: string, topNav: TopNavConfig): SubmenuConfig {
  return (
    topNav.submenus.find(
      (submenu) => pathname === submenu.path || pathname.startsWith(`${submenu.path}/`)
    ) ?? topNav.submenus[0]
  )
}

export function getNavigationContext(
  pathname: string,
  navigationConfig: TopNavConfig[]
): NavigationContext {
  const topNav = matchTopNav(pathname, navigationConfig)
  const submenu = matchSubmenu(pathname, topNav)

  return {
    topNav,
    submenu,
  }
}

export function getAllSubmenuPaths(navigationConfig: TopNavConfig[]): string[] {
  return navigationConfig.flatMap((topNav) => topNav.submenus.map((submenu) => submenu.path))
}
