/**
 * アプリケーション共通ヘッダー
 * 全ページで統一されたヘッダーを提供
 */

import { Link, useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { navigationConfig } from '@/mocks/data/navigation'
import { getNavigationContext } from '@/app/navigation-context'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function AppHeader() {
  const location = useLocation()
  const context = getNavigationContext(location.pathname)

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4">
        <Link to="/dashboard/overview" className="font-semibold tracking-tight">
          WorkOps
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationConfig.map((topNav) => {
              const isActive = context.topNav.id === topNav.id

              return (
                <NavigationMenuItem key={topNav.id}>
                  <NavigationMenuTrigger
                    className={cn(isActive && 'bg-accent text-accent-foreground')}
                  >
                    {topNav.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-1 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {topNav.submenus.map((submenu) => (
                        <li key={submenu.id}>
                          <Link
                            to={submenu.path}
                            className={cn(
                              'group flex flex-row items-center gap-3 rounded-md px-3 py-2 leading-none no-underline outline-none focus-visible:outline-none',
                              context.submenu.id === submenu.id && 'bg-accent'
                            )}
                          >
                            <div className="flex size-8 items-center justify-center rounded-md transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                              <submenu.icon className="size-4 text-muted-foreground group-hover:text-accent-foreground" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-sm font-medium leading-none">
                                {submenu.label}
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {submenu.description}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden w-72 lg:block">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search..." />
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Dev
          </Badge>
          <Bell className="size-4 text-muted-foreground" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar size="sm">
                  <AvatarFallback>MM</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
