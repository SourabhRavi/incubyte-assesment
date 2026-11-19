import * as React from "react"
import { NavLink, useLocation } from "react-router"
import { ChartNoAxesCombined, Command, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

const navigation = [{ title: "Overview", url: "/overview", icon: ChartNoAxesCombined }, { title: "Employees", url: "/employees", icon: Users }] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const closeMobile = () => { if (isMobile) setOpenMobile(false) }

  return (
    <Sidebar collapsible="offcanvas" className="peopleops-sidebar border-r-0 bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/80 px-4 py-4">
        <SidebarMenu><SidebarMenuItem>
          <SidebarMenuButton size="lg" tooltip="ACME People" className="h-12 rounded-xl px-1 hover:bg-transparent" render={<NavLink to="/overview" onClick={closeMobile} />}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#315DEB] text-white shadow-sm"><Command className="size-[18px]!" /></span>
            <span className="flex min-w-0 flex-col items-start gap-0.5"><span className="text-[15px] leading-none font-bold tracking-[-0.04em]">ACME People</span><span className="text-[11px] font-medium text-muted-foreground">People management</span></span>
          </SidebarMenuButton>
        </SidebarMenuItem></SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8791A2]">Main menu</SidebarGroupLabel>
          <SidebarMenu className="gap-1">{navigation.map(({ title, url, icon: Icon }) => (
            <SidebarMenuItem key={url}><SidebarMenuButton render={<NavLink to={url} onClick={closeMobile} />} isActive={pathname === url} tooltip={title} className="h-9 rounded-lg px-3 text-[13px] font-medium text-[#626D7D] hover:bg-white hover:text-[#252D3B] data-[active=true]:bg-white data-[active=true]:text-[#26344B] data-[active=true]:shadow-[0_1px_3px_rgba(25,35,55,0.08)] data-[active=true]:ring-1 data-[active=true]:ring-[#E5EAF1]"><Icon className="size-4" /><span>{title}</span></SidebarMenuButton></SidebarMenuItem>
          ))}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-5 p-0">
          <SidebarGroupLabel className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8791A2]">Workspace</SidebarGroupLabel>
          <div className="mx-3 rounded-lg border border-[#E8ECF1] bg-white/70 px-3 py-3"><p className="text-xs font-semibold text-[#394456]">Compensation</p><p className="mt-1 text-[11px] leading-relaxed text-[#8791A2]">Salary insights and workforce reporting</p></div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/80 p-3"><SidebarMenu><SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip="People Operations" className="h-12 cursor-default rounded-xl px-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E8EDFF] text-[11px] font-bold text-[#315DEB]">HR</span><span className="flex min-w-0 flex-col items-start gap-0.5"><span className="truncate text-xs font-semibold text-[#394456]">People Operations</span><span className="truncate text-[10px] text-muted-foreground">Administrator</span></span></SidebarMenuButton>
      </SidebarMenuItem></SidebarMenu></SidebarFooter>
    </Sidebar>
  )
}
export default AppSidebar