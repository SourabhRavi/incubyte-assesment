import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { Moon, Search, Sun, X } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"

const pageTitles: Record<string, string> = { "/overview": "Overview", "/employees": "Employees" }

export default function AppLayout() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const title = pageTitles[pathname] ?? "Overview"
  const isEmployeesPage = pathname === "/employees"
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  const [searchValue, setSearchValue] = useState(() => new URLSearchParams(search).get("search") ?? "")
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearchValue(new URLSearchParams(search).get("search") ?? "")
  }, [search, pathname])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchValue.trim()) params.set("search", searchValue.trim())
    navigate({ pathname: "/employees", search: params.toString() ? "?" + params.toString() : "" })
  }

  return <SidebarProvider defaultOpen style={{ "--sidebar-width": "227px", "--sidebar-width-icon": "64px" } as CSSProperties}>
    <AppSidebar />
    <SidebarInset className={`min-w-0 bg-background ${isEmployeesPage ? "h-svh overflow-hidden" : "min-h-svh"}`}>
      <header className="peopleops-topbar sticky top-0 z-50 flex h-[78px] shrink-0 items-center justify-between gap-4 border-b border-border px-[27px] backdrop-blur-xl max-md:px-4">
        <div className="flex min-w-0 items-center gap-[15px] text-[13px]">
          <SidebarTrigger className="size-8 shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
          <span className="hidden text-muted-foreground sm:inline">Workspace</span><span className="hidden text-muted-foreground/60 sm:inline">/</span><span className="font-medium text-foreground">{title}</span>
        </div>
        <div className="flex min-w-0 items-center gap-4 sm:gap-[22px]">
          <form role="search" onSubmit={submitSearch} className="flex h-[40px] w-[274px] min-w-0 items-center gap-[10px] rounded-[9px] border border-transparent bg-muted px-[12px] text-muted-foreground transition-all focus-within:border-ring focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/20 max-sm:w-10 max-sm:focus-within:absolute max-sm:focus-within:right-16 max-sm:focus-within:z-40 max-sm:focus-within:w-[min(70vw,274px)]">
            <button type="submit" aria-label="Search employees" className="shrink-0"><Search className="size-[16px]" /></button>
            <input ref={searchRef} value={searchValue} onChange={event => setSearchValue(event.target.value)} placeholder="Search employees" aria-label="Search employees by name or email" className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground max-sm:w-0 max-sm:focus:w-auto max-sm:placeholder:opacity-0 max-sm:focus:placeholder:opacity-100" />
            {searchValue && <button type="button" aria-label="Clear search" onClick={() => setSearchValue("")} className="shrink-0 rounded p-0.5 hover:bg-accent"><X className="size-3.5" /></button>}
            <kbd className="shrink-0 text-[10px] max-sm:hidden">⌘ K</kbd>
          </form>
          <button type="button" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} title={`Switch to ${isDark ? "light" : "dark"} mode`} onClick={() => setTheme(isDark ? "light" : "dark")} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">{isDark ? <Sun className="size-[19px]" /> : <Moon className="size-[19px]" />}</button>
          <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">AM</span>
        </div>
      </header>
      <div className={`min-w-0 flex-1 ${isEmployeesPage ? "min-h-0 overflow-hidden" : ""}`}><Outlet /></div>
    </SidebarInset>
  </SidebarProvider>
}
