import { Outlet, useLocation } from "react-router"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"

const pageTitles: Record<string,string> = { "/overview":"Dashboard", "/employees":"Employees" }

const AppLayout = () => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? "ACME People"
  const isEmployeesPage = pathname === "/employees"
  const { theme,setTheme } = useTheme()
  const isDark = theme === "dark"
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />

      <SidebarInset className="h-svh min-h-0 min-w-0 overflow-x-hidden overflow-y-auto bg-[#F7F8FC]">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-3 border-b border-[#E7EAF2] bg-white px-6 shadow-none sm:px-10">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger
              className="shrink-0"
              aria-label="Toggle navigation sidebar"
              title="Toggle navigation sidebar"
            />

            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#777F92]">{title === "Overview" ? "Workspace   /   Overview" : `Workspace   /   ${title}`}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                PeopleOps / {title}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </header>
        <div className={isEmployeesPage?"peopleops-page-shell mx-auto w-full max-w-[1440px] md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden":"peopleops-page-shell w-full flex-1 p-4 sm:p-5 lg:p-6"}><Outlet/></div>
      </SidebarInset>
    </SidebarProvider>
  )
}
export default AppLayout
