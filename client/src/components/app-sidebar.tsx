import * as React from "react"
import { NavLink, useLocation } from "react-router"
import { ChartNoAxesCombined, Command, Users } from "lucide-react"

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
    icon: ChartNoAxesCombined,
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

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0 bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/80 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="PeopleOps"
              className="h-14 rounded-2xl px-2 data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <NavLink
                  to="/overview"
                  onClick={() => {
                    if (isMobile) {
                      setOpenMobile(false)
                    }
                  }}
                />
              }
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0A0A0B] text-white shadow-sm">
                <Command className="size-5!" />
              </span>

              <span className="flex min-w-0 flex-col items-start gap-0.5">
                <span className="text-base leading-none font-semibold">
                  PeopleOps
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  Salary management
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">Workspace</SidebarGroupLabel>

          <SidebarMenu className="gap-1.5">
            {navigation.map(({ title, url, icon: Icon }) => (
              <SidebarMenuItem key={url}>
                <SidebarMenuButton
                  render={
                    <NavLink
                      to={url}
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false)
                        }
                      }}
                    />
                  }
                  isActive={pathname === url}
                  tooltip={title}
                >
                  <Icon />
                  <span>{title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="HR Manager"
              className="cursor-default"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
                HR
              </span>

              <span className="flex min-w-0 flex-col items-start gap-1">
                <span className="truncate text-sm font-medium">HR Manager</span>
                <span className="truncate text-xs text-muted-foreground">
                  People team
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
