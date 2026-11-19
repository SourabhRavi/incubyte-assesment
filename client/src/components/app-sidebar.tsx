import * as React from "react"
import { NavLink, useLocation } from "react-router"
import { ChartNoAxesCombined, Command, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

const navigation = [
  { title: "Overview", url: "/overview", icon: ChartNoAxesCombined },
  { title: "Employees", url: "/employees", icon: Users },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const closeMobile = () => { if (isMobile) setOpenMobile(false) }

  return (
    <Sidebar collapsible="offcanvas" className="peopleops-sidebar border-r-0 bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <SidebarMenu><SidebarMenuItem>
          <SidebarMenuButton size="lg" tooltip="ACME People" className="h-11 rounded-lg px-1 hover:bg-transparent" render={<NavLink to="/overview" onClick={closeMobile} />}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#315DEB] text-white"><Command className="size-4" /></span>
            <span className="flex min-w-0 flex-col items-start gap-0.5"><span className="text-[14px] leading-none font-bold tracking-[-0.04em]">ACME People</span><span className="text-[10px] font-medium text-muted-foreground">People management</span></span>
          </SidebarMenuButton>
        </SidebarMenuItem></SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8993A2]">Main menu</SidebarGroupLabel>
          <SidebarMenu className="gap-1">{navigation.map(({ title,url,icon:Icon })=>(
            <SidebarMenuItem key={url}><SidebarMenuButton render={<NavLink to={url} onClick={closeMobile} />} isActive={pathname===url} tooltip={title} className="h-8 rounded-md px-3 text-[11px] font-medium text-[#657184] hover:bg-white hover:text-[#283447] data-[active=true]:bg-white data-[active=true]:text-[#24334C] data-[active=true]:shadow-[0_1px_3px_rgba(25,35,55,0.08)] data-[active=true]:ring-1 data-[active=true]:ring-[#E6EBF1]"><Icon className="size-3.5"/><span>{title}</span></SidebarMenuButton></SidebarMenuItem>
          ))}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-5 p-0">
          <SidebarGroupLabel className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8993A2]">Workspace</SidebarGroupLabel>
          <div className="mx-2 rounded-md border border-[#E8ECF1] bg-white/70 px-2.5 py-2.5"><p className="text-[11px] font-semibold text-[#394456]">Compensation</p><p className="mt-1 text-[10px] leading-relaxed text-[#8791A2]">Salary insights and workforce reporting</p></div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2"><SidebarMenu><SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip="People Operations" className="h-10 cursor-default rounded-lg px-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E8EDFF] text-[10px] font-bold text-[#315DEB]">HR</span><span className="flex min-w-0 flex-col items-start gap-0.5"><span className="truncate text-[11px] font-semibold text-[#394456]">People Operations</span><span className="truncate text-[9px] text-muted-foreground">Administrator</span></span></SidebarMenuButton>
      </SidebarMenuItem></SidebarMenu></SidebarFooter>
    </Sidebar>
  )
}
export default AppSidebar
