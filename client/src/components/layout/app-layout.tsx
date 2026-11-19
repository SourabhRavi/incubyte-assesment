import { Link, Outlet, useLocation } from "react-router"
import { Moon, Search } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"

const pageTitles: Record<string, string> = { "/overview": "Overview", "/employees": "Employees" }

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? "Overview"
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return <SidebarProvider defaultOpen style={{ "--sidebar-width": "227px", "--sidebar-width-icon": "64px" } as React.CSSProperties}>
    <AppSidebar />
    <SidebarInset className="min-h-svh min-w-0 overflow-x-hidden bg-[#F7F8FC]">
      <header className="sticky top-0 z-30 flex h-[78px] shrink-0 items-center justify-between gap-4 border-b border-[#E5E8F0] bg-white px-[27px] max-md:px-4">
        <div className="flex min-w-0 items-center gap-[15px] text-[13px]">
          <SidebarTrigger className="size-8 shrink-0 rounded-md text-[#68758E] hover:bg-[#F1F2F8] hover:text-[#5146D8]" />
          <span className="hidden text-[#78839A] sm:inline">Workspace</span><span className="hidden text-[#A0A8B8] sm:inline">/</span><span className="font-medium text-[#30354A]">{title}</span>
        </div>
        <div className="flex items-center gap-[22px]">
          <Link to="/employees" aria-label="Search employees" className="flex h-[40px] w-[274px] items-center gap-[11px] rounded-[9px] bg-[#F7F8FC] px-[13px] text-[#78839A] transition-colors hover:bg-[#F0F1F8] max-sm:w-10 max-sm:justify-center max-sm:px-0">
            <Search className="size-[16px]" /><span className="text-[12px] max-sm:hidden">Search employees</span><kbd className="ml-auto text-[11px] max-sm:hidden">⌘ K</kbd>
          </Link>
          <button type="button" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} title={`Switch to ${isDark ? "light" : "dark"} mode`} onClick={() => setTheme(isDark ? "light" : "dark")} className="rounded-full p-1 text-[#69758D] transition-colors hover:bg-[#F4F5FA]"><Moon className="size-[19px]" /></button>
          <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#EDEBFF] text-[10px] font-semibold text-[#5146D8]">AM</span>
        </div>
      </header>
      <div className="min-w-0 flex-1"><Outlet /></div>
    </SidebarInset>
  </SidebarProvider>
}
