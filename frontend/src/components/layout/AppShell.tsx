import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Bell,
  ChevronDown,
  Factory,
  Grid2X2,
  Layers,
  LayoutDashboard,
  LogOut,
  Mic2,
  Settings,
  ClipboardCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types/api'

const roleLabel: Record<Role, string> = {
  leader: 'リーダー',
  worker: '作業者',
  safety_manager: '安全管理',
}

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles: Role[]
}

const mainNavItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'ダッシュボード',
    icon: LayoutDashboard,
    roles: ['leader', 'worker', 'safety_manager'],
  },
  {
    to: '/incidents',
    label: 'インシデント',
    icon: AlertTriangle,
    roles: ['leader', 'safety_manager'],
  },
  {
    to: '/manuals',
    label: 'マニュアル',
    icon: BookOpen,
    roles: ['leader', 'worker', 'safety_manager'],
  },
  {
    to: '/works/explorer',
    label: '全件ビュー',
    icon: Layers,
    roles: ['leader', 'safety_manager'],
  },
]

const managementNavItems: NavItem[] = [
  {
    to: '/unsigned-works',
    label: '署名前作業',
    icon: ClipboardCheck,
    roles: ['leader', 'worker', 'safety_manager'],
  },
  {
    to: '/meetings',
    label: '会議/音声',
    icon: Mic2,
    roles: ['leader', 'safety_manager'],
  },
  {
    to: '/notifications',
    label: 'お知らせ管理',
    icon: Bell,
    roles: ['leader', 'safety_manager'],
  },
  {
    to: '/works/new',
    label: '作業作成',
    icon: Grid2X2,
    roles: ['leader'],
  },
  {
    to: '/groups',
    label: 'グループ管理',
    icon: Factory,
    roles: ['leader'],
  },
]

export default function AppShell() {
  const { currentUser, logout } = useAuthStore()
  const location = useLocation()
  const [managementOpen, setManagementOpen] = useState(true)
  const isActivePath = (target: string) =>
    location.pathname === target || location.pathname.startsWith(`${target}/`)
  const visibleMainItems = mainNavItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false,
  )
  const visibleManagementItems = managementNavItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false,
  )
  const managementActive = visibleManagementItems.some((item) => isActivePath(item.to))

  return (
    <SidebarProvider className="min-h-screen holo-grid text-foreground">
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-3 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
              RC
            </span>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">Risk Check</p>
              <p className="text-xs text-muted-foreground">Safety Operations</p>
            </div>
          </NavLink>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu className="px-2">
            {visibleMainItems.map((item) => {
              const Icon = item.icon
              const active = isActivePath(item.to)
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                    <NavLink to={item.to} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
          {visibleManagementItems.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="sr-only">管理</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={managementActive}>
                      <button
                        type="button"
                        onClick={() => setManagementOpen((current) => !current)}
                        className="flex w-full items-center justify-between gap-2"
                        aria-expanded={managementOpen}
                      >
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          管理
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${managementOpen ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                {managementOpen && (
                  <SidebarMenu className="mt-1">
                    {visibleManagementItems.map((item) => {
                      const Icon = item.icon
                      const active = isActivePath(item.to)
                      return (
                        <SidebarMenuItem key={item.to}>
                          <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                            <NavLink to={item.to} className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="px-3 py-4">
          {currentUser && (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-4 py-3 transition-all hover:bg-sidebar-accent/70">
              <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
              <Badge className="mt-2 border border-sidebar-border/60 bg-transparent text-sidebar-foreground hover:bg-sidebar-accent">
                {roleLabel[currentUser.role]}
              </Badge>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="hidden flex-col sm:flex">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                Navigation
              </span>
              <span className="text-sm font-semibold text-foreground">Risk Check</span>
            </div>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                {currentUser.name}
              </span>
              <Badge className="border border-border/50 bg-background shadow-sm">
                {roleLabel[currentUser.role]}
              </Badge>
            </div>
          )}
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-8">
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
