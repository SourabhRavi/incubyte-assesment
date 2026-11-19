import { Outlet, useLocation } from "react-router"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"

const pageTitles: Record<string, string> = { "/overview": "Dashboard", "/employees": "Employees" }

const AppLayout = () => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? "ACME People"
  const isEmployeesPage = pathname === "/employees"
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="peopleops-inset h-svh min-h-0 min-w-0 overflow-x-hidden overflow-y-auto bg-background">
        <header className="peopleops-topbar sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-border bg-white/95 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><SidebarTrigger className="size-8 shrink-0 rounded-lg text-[#657184] hover:bg-[#F1F4F8]" aria-label="Toggle navigation sidebar" title="Toggle navigation sidebar" /><div className="h-4 w-px bg-[#E7EBF0]" /><p className="truncate text-[12px] font-medium text-[#465164]">{title}</p></div>
          <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg text-[#788397] hover:bg-[#F1F4F8]" aria-label={"Switch to " + (isDark ? "light" : "dark") + " mode"} title={"Switch to " + (isDark ? "light" : "dark") + " mode"} onClick={() => setTheme(isDark ? "light" : "dark")}>{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
        </header>
        <div className={isEmployeesPage ? "peopleops-page-shell mx-auto w-full max-w-[1440px] md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden" : "peopleops-page-shell mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-5 lg:p-6"}><Outlet /></div>
      </SidebarInset>
    </SidebarProvider>
  )
}
export default AppLayout