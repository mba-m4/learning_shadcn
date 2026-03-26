import { FileText, FolderKanban, Home, PlusSquare } from "lucide-react"
import { NavLink, useLocation } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const primaryNavigation = [
  {
    title: "Home",
    to: "/",
    icon: Home,
    end: true,
  },
  {
    title: "Documents",
    to: "/documents",
    icon: FolderKanban,
    end: false,
  },
] as const

const actionNavigation = [
  {
    title: "New Document",
    to: "/documents/new",
    icon: PlusSquare,
    end: false,
  },
] as const

export function AppSidebar() {
  const location = useLocation()

  const isActivePath = (to: string, end?: boolean) => {
    if (end) {
      return location.pathname === to
    }

    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-primary/10 px-2.5 py-2 text-sidebar-foreground">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
            <p className="truncate text-sm font-semibold">Template Lab</p>
            <p className="truncate text-xs text-sidebar-foreground/65">
              React Query CRUD Playground
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNavigation.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={isActivePath(item.to, item.end)}
                    render={<NavLink end={item.end} to={item.to} />}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actionNavigation.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={isActivePath(item.to)}
                    render={<NavLink to={item.to} />}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-3 text-sm group-data-[state=collapsed]/sidebar:px-2 group-data-[state=collapsed]/sidebar:py-2">
          <p className="font-medium group-data-[state=collapsed]/sidebar:hidden">
            UI state + server state
          </p>
          <p className="mt-1 text-sidebar-foreground/65 group-data-[state=collapsed]/sidebar:hidden">
            Zustand と React Query の責務分離をこのまま追える構成です。
          </p>
          <div className="hidden items-center justify-center group-data-[state=collapsed]/sidebar:flex">
            <FileText className="size-4" />
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
