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
    <Sidebar collapsible="offcanvas" className="border-r border-[#E7EAF2] bg-white" {...props}>
      <SidebarHeader className="border-b border-[#E7EAF2] px-5 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="PeopleOps"
              className="h-11 data-[slot=sidebar-menu-button]:p-1.5!"
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
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-[#5146D8] text-white">
                <span className="text-[21px] font-semibold leading-none">p</span>
              </span>

              <span className="flex min-w-0 flex-col items-start gap-0.5">
                <span className="text-[22px] leading-none font-semibold tracking-[-0.5px] text-[#25283A]">
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
          <SidebarGroupLabel className="px-2 pb-3 pt-7 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#777F92]">Workspace</SidebarGroupLabel>

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
                  isActive={pathname === url}\n                  className="h-11 rounded-lg px-4 text-[13px] data-[active=true]:bg-[#EDEBFF] data-[active=true]:font-semibold data-[active=true]:text-[#5146D8] data-[active=true]:shadow-none"
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

      <SidebarFooter className="border-t border-[#E7EAF2] px-5 py-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="HR Manager"
              className="cursor-default"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EDEBFF] text-xs font-semibold text-[#5146D8]">
                HR
              </span>

              <span className="flex min-w-0 flex-col items-start gap-1">
                <span className="truncate text-[13px] font-semibold text-[#25283A]">Alex Morgan</span>
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
