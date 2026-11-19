import { useNavigate, useLocation, Outlet } from "react-router"
import { Moon, Search, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"

const pageTitles: Record<string, string> = {
  "/overview": "Overview",
  "/employees": "Employees",
}

const AppLayout = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = pageTitles[pathname] ?? "PeopleOps"
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />

      <SidebarInset className="min-h-svh min-w-0 overflow-x-hidden bg-background">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <SidebarTrigger
              className="shrink-0 lg:hidden"
              aria-label="Toggle navigation sidebar"
              title="Toggle navigation sidebar"
            />
            <div className="flex min-w-0 items-center gap-3 text-[13px]">
              <span className="truncate text-muted-foreground">Workspace</span>
              <span className="text-muted-foreground/60">/</span>
              <span className="truncate font-medium text-foreground">{title}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="hidden h-10 w-56 items-center gap-3 rounded-lg bg-background px-3 text-left text-xs text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex lg:w-[280px]"
              aria-label="Open employee search"
            >
              <Search className="size-[17px]" />
              <span className="flex-1">Search employees</span>
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
            </button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="size-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/employees")}
              aria-label="HR Manager profile"
              title="HR Manager"
              className="flex size-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary"
            >
              AM
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-none flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AppLayout
