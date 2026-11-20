import * as React from "react"
import { NavLink, useLocation } from "react-router"
import { LayoutGrid, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

const navigation = [
  { title: "Overview", url: "/overview", icon: LayoutGrid },
  { title: "Employees", url: "/employees", icon: Users },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="peopleops-sidebar border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]" {...props}>
      <SidebarHeader className="border-b-0 px-[27px] pb-[30px] pt-[29px] group-data-[collapsible=icon]:px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="PeopleOps" className="h-auto min-h-0 gap-[10px] p-0 hover:bg-transparent data-[slot=sidebar-menu-button]:p-0">
              <NavLink to="/overview" className="flex items-center gap-[10px] group-data-[collapsible=icon]:justify-center" onClick={() => isMobile && setOpenMobile(false)}>
                <span className="flex size-[31px] shrink-0 items-center justify-center rounded-[9px] bg-[var(--primary)] text-white"><span className="text-[22px] font-semibold leading-none">p</span></span>
                <span className="text-[21px] font-semibold tracking-[-0.55px] text-[var(--foreground)] group-data-[collapsible=icon]:hidden">PeopleOps</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-[15px] pt-[15px] group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-[12px] pb-[14px] text-[9px] font-semibold uppercase tracking-[0.02em] text-[var(--muted-foreground)] group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
          <SidebarMenu className="gap-[5px]">
            {navigation.map(({ title, url, icon: Icon }) => <SidebarMenuItem key={url}>
              <SidebarMenuButton isActive={pathname === url} tooltip={title} className="relative h-[43px] rounded-[8px] px-[15px] text-[13px] font-medium text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--primary)] data-[active=true]:bg-[var(--secondary)] data-[active=true]:font-semibold data-[active=true]:text-[var(--primary)] data-[active=true]:shadow-none before:absolute before:bottom-[12px] before:left-0 before:top-[12px] before:w-[3px] before:rounded-r before:bg-transparent data-[active=true]:before:bg-[var(--primary)]" render={<NavLink to={url} onClick={() => isMobile && setOpenMobile(false)} />}>
                <Icon className="size-[17px] shrink-0" /><span className="group-data-[collapsible=icon]:hidden">{title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mx-[23px] border-t border-[var(--sidebar-border)] px-0 pb-[27px] pt-[22px] group-data-[collapsible=icon]:mx-2">
        <SidebarMenu><SidebarMenuItem>
          <SidebarMenuButton size="lg" tooltip="Alex Morgan" className="h-auto min-h-0 cursor-default gap-[12px] p-0 hover:bg-transparent">
            <span className="flex size-[31px] shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[11px] font-semibold text-[var(--primary)]">AM</span>
            <span className="flex min-w-0 flex-col items-start gap-[3px] group-data-[collapsible=icon]:hidden"><span className="text-[12px] font-semibold text-[var(--foreground)]">Alex Morgan</span><span className="text-[10px] text-[var(--muted-foreground)]">HR Manager</span></span>
          </SidebarMenuButton>
        </SidebarMenuItem></SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
export default AppSidebar
