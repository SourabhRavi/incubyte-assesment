import * as React from "react"
import { NavLink, useLocation } from "react-router"
import { LayoutDashboard, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigation = [
  {
    title: "Overview",
    url: "/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
  },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  const closeMobileNavigation = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border px-6 py-[30px]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="PeopleOps"
              className="h-auto gap-3 p-0 hover:bg-transparent data-[slot=sidebar-menu-button]:p-0!"
              render={
                <NavLink to="/overview" onClick={closeMobileNavigation} />
              }
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-[26px] leading-none font-semibold text-primary-foreground">
                p
              </span>
              <span className="text-[22px] leading-none font-semibold tracking-tight text-sidebar-foreground">
                PeopleOps
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-4 pt-7">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-3 px-3 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">
            WORKSPACE
          </SidebarGroupLabel>

          <SidebarMenu className="gap-1">
            {navigation.map(({ title, url, icon: Icon }) => (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton
                  render={
                    <NavLink to={url} onClick={closeMobileNavigation} />
                  }
                  isActive={pathname === url}
                  tooltip={title}
                  className="relative h-11 rounded-lg px-4 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-semibold data-[active=true]:text-primary"
                >
                  <Icon className="size-[18px]" strokeWidth={1.8} />
                  <span>{title}</span>
                  {pathname === url && (
                    <span className="absolute top-[13px] left-0 h-[18px] w-[3px] rounded-r bg-primary" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-6 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="HR Manager"
              className="h-auto cursor-default gap-3 p-0 hover:bg-transparent data-[slot=sidebar-menu-button]:p-0!"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary">
                AM
              </span>
              <span className="flex min-w-0 flex-col items-start gap-1">
                <span className="truncate text-[13px] font-semibold text-sidebar-foreground">
                  Alex Morgan
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  HR Manager
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
