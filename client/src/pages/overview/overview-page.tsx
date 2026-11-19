import { useState, type ComponentType, type ReactNode } from "react"
import { ArrowUpRight, Globe, LoaderCircle, RefreshCw, Users, Wallet, X } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Link } from "react-router"
import { useAllSalarySummaries, useJobTitleAverages, useSalarySummary } from "@/features/analytics/analytics-queries"
import { COUNTRIES, COUNTRY_CURRENCIES, type Country } from "@/features/employees/employee-types"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const COLORS = ["#5146D8", "#3978DF", "#239F96", "#E49A25", "#9675DF", "#5A9EAD", "#BD7D9D", "#829B68"]
const money = (value: number | string | null | undefined, currency: string) => {
  if (value === null || value === undefined || value === "") return "—"
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "—"
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}
const compactMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, notation: "compact", maximumFractionDigits: 0 }).format(value)

type MetricProps = { title: string; value: string; detail: string; icon: ComponentType<{ className?: string }>; loading?: boolean; highlighted?: boolean }
function MetricCard({ title, value, detail, icon: Icon, loading, highlighted }: MetricProps) {
  return <section className="peopleops-metric min-w-0 rounded-[8px] border border-[#E3E7F0] bg-white px-[18px] py-[18px]">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[13px] font-medium text-[#69758D]">{title}</p>
      <Icon className={`size-[17px] ${highlighted ? "text-[#5146D8]" : "text-[#75819A]"}`} />
    </div>
    <div className="mt-[17px] flex min-h-[37px] items-center">
      {loading ? <LoaderCircle className="size-5 animate-spin text-[#8993A8]" /> : <p className="truncate text-[28px] font-semibold leading-none tracking-[-0.8px] text-[#292D40] tabular-nums">{value}</p>}
    </div>
    <p className="mt-[11px] text-[11px] text-[#78839A]">{detail}</p>
  </section>
}
function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: ReactNode; className?: string }) {
  return <section className={`peopleops-chart-panel min-w-0 overflow-hidden rounded-[12px] border border-[#E3E7F0] bg-white ${className}`}>
    <header className="px-[22px] pt-[20px]">
      <h2 className="text-[16px] font-semibold tracking-[-0.25px] text-[#292D40]">{title}</h2>
      <p className="mt-[5px] text-[12px] text-[#78839A]">{subtitle}</p>
    </header>
    {children}
  </section>
}
function EmptyState({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[210px] items-center justify-center px-6 text-center text-[12px] text-[#78839A]">{children}</div>
}

export default function OverviewPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const allMarkets = useAllSalarySummaries()
  const summaryQuery = useSalarySummary(selectedCountry)
  const rolesQuery = useJobTitleAverages(selectedCountry)
  const summary = summaryQuery.data
  const roles = rolesQuery.data?.data ?? []
  const currency = summary?.currency ?? rolesQuery.data?.currency ?? COUNTRY_CURRENCIES[selectedCountry]
  const count = summary?.employeeCount ?? roles.reduce((total, role) => total + role.employeeCount, 0)
  const totalRoleEmployees = roles.reduce((total, role) => total + role.employeeCount, 0)
  const isRefreshing = summaryQuery.isFetching || rolesQuery.isFetching || allMarkets.some((query) => query.isFetching)
  const refresh = async () => {
    await Promise.all([summaryQuery.refetch(), rolesQuery.refetch(), ...allMarkets.map((query) => query.refetch())])
  }
  return <main className="peopleops-overview w-full space-y-[23px] px-[26px] pb-12 pt-[31px] max-sm:px-4">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.8px] text-[#292D40]">People overview</h1>
        <p className="mt-[10px] text-[14px] text-[#78839A]">A clear view of your workforce and compensation.</p>
        <div className="mt-[15px] flex flex-wrap items-center gap-3">
          <span className="rounded-[5px] bg-[#EDEBFF] px-[10px] py-[6px] text-[9px] font-semibold tracking-[0.02em] text-[#5146D8]">{selectedCountry.toUpperCase()} / {currency} · ANNUAL</span>
          <span className="text-[10px] text-[#78839A]">Salary figures reflect {selectedCountry} only. Sample data.</span>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-[1px]">
        <div className="peopleops-country-select relative w-[199px]">
          <Globe aria-hidden="true" className="pointer-events-none absolute left-[14px] top-1/2 z-[1] size-[16px] -translate-y-1/2 text-[#5146D8]" />
          <NativeSelect
            id="overview-country"
            aria-label="Reporting country"
            value={selectedCountry}
            onChange={(event) => { setSelectedCountry(event.target.value as Country); setActiveRole(null) }}
            selectClassName="h-[43px] w-full rounded-[8px] border-[#E3E7F0] bg-white pl-[40px] pr-9 text-[12px] font-semibold text-[#30354A] shadow-none focus-visible:border-[#5146D8] focus-visible:ring-2 focus-visible:ring-[#5146D8]/15"
          >
            {COUNTRIES.map((country) => (
              <NativeSelectOption key={country} value={country}>
                {country}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={isRefreshing} className="peopleops-action-button inline-flex h-[43px] items-center gap-2 rounded-[8px] border border-[#E3E7F0] bg-white px-[14px] text-[12px] font-medium text-[#30354A] hover:bg-[#F8F9FC] disabled:opacity-60">
          <RefreshCw className={`size-[14px] ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>
    </div>

    {(summaryQuery.isError || rolesQuery.isError) && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800">Some compensation data could not be loaded. <button className="ml-2 underline" onClick={() => void refresh()}>Retry</button></div>}

    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <MetricCard title="Total employees" value={summaryQuery.isPending ? "—" : count.toLocaleString("en-IN")} detail={`${selectedCountry} · people`} icon={Users} loading={summaryQuery.isPending} />
      <MetricCard title="Minimum salary" value={money(summary?.minSalary, currency)} detail={`${selectedCountry} · ${currency} / year`} icon={Wallet} loading={summaryQuery.isPending} />
      <MetricCard title="Average salary" value={money(summary?.averageSalary, currency)} detail={`${selectedCountry} · ${currency} / year`} icon={Wallet} highlighted loading={summaryQuery.isPending} />
      <MetricCard title="Maximum salary" value={money(summary?.maxSalary, currency)} detail={`${selectedCountry} · ${currency} / year`} icon={Wallet} loading={summaryQuery.isPending} />
    </div>

    <div className="grid items-stretch gap-6 xl:grid-cols-[1.18fr_0.88fr]">
      <Panel title="Average salary by role" subtitle={"Annual compensation · " + currency} className="h-full flex flex-col">
        {rolesQuery.isPending ? <EmptyState>Loading salary breakdown…</EmptyState> : rolesQuery.isError ? <EmptyState>Unable to load role salary data.</EmptyState> : roles.length === 0 ? <EmptyState>No active employee data for {selectedCountry} yet.</EmptyState> :
          <div className="peopleops-chart-body flex flex-1 flex-col px-5 pb-4 pt-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#78839A]">Average annual salary by job title</span>
              {activeRole && <button type="button" onClick={() => setActiveRole(null)} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#5146D8] hover:underline">Clear focus <X className="size-3" /></button>}
            </div>
            {(() => {
              const maxSalary = Math.max(...roles.map((role) => role.averageSalary), 1);
              const axisMax = Math.ceil(maxSalary / 500000) * 500000;
              const ticks = [0, 0.25, 0.5, 0.75, 1];
              return <>
                <div className="flex flex-1 flex-col justify-between gap-2">
                  {roles.map((role, index) => {
                    const isFocused = activeRole === role.jobTitle;
                    const isDimmed = Boolean(activeRole && !isFocused);
                    return <button
                      key={role.jobTitle}
                      type="button"
                      onClick={() => setActiveRole(isFocused ? null : role.jobTitle)}
                      title={role.jobTitle + " · " + money(role.averageSalary, currency)}
                      aria-pressed={isFocused}
                      className={`group grid w-full grid-cols-[minmax(112px,150px)_minmax(0,1fr)_minmax(92px,112px)] items-center gap-3 rounded-md py-1.5 text-left transition-colors hover:bg-[#F7F8FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5146D8]/40 ${isFocused ? "bg-[#F4F2FF]" : ""}`}
                    >
                      <span className={`truncate text-[11px] font-medium ${isDimmed ? "text-[#A5AABC]" : "text-[#394258]"}`}>{role.jobTitle}</span>
                      <span className="relative block h-5 min-w-0 overflow-hidden rounded-[5px] bg-[#F1F2F8]">
                        <span className="absolute inset-y-0 left-0 rounded-[5px] transition-[width,opacity] duration-300" style={{ width: `${Math.max(2, (role.averageSalary / axisMax) * 100)}%`, backgroundColor: isDimmed ? "#E4E5EF" : COLORS[index % COLORS.length], opacity: isDimmed ? 0.55 : 1 }} />
                      </span>
                      <span className={`whitespace-nowrap text-right text-[10px] font-semibold tabular-nums ${isDimmed ? "text-[#A5AABC]" : "text-[#394258]"}`}>{money(role.averageSalary, currency)}</span>
                    </button>;
                  })}
                </div>
                <div className="mt-3 grid grid-cols-[minmax(112px,150px)_minmax(0,1fr)_minmax(92px,112px)] items-start gap-3 border-t border-[#EEF0F6] pt-2">
                  <span />
                  <div className="flex justify-between text-[9px] tabular-nums text-[#8992A6]">
                    {ticks.map((tick) => <span key={tick}>{compactMoney(axisMax * tick, currency)}</span>)}
                  </div>
                  <span />
                </div>
              </>;
            })()}
          </div>}
      </Panel>

      <Panel title="Workforce mix" subtitle={"Active employees by job title · " + selectedCountry} className="h-full flex flex-col">
        {rolesQuery.isPending ? <EmptyState>Loading workforce mix…</EmptyState> : rolesQuery.isError || roles.length === 0 ? <EmptyState>No workforce data to display yet.</EmptyState> :
          <div className="peopleops-chart-body flex flex-1 flex-col px-4 pb-4 pt-4">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <span className="text-[10px] text-muted-foreground">Employee distribution</span>
              <span className="text-[10px] font-semibold tabular-nums text-foreground">{totalRoleEmployees.toLocaleString("en-IN")} employees</span>
            </div>
            <div className="min-h-[270px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roles} margin={{ top: 12, right: 4, bottom: 12, left: 0 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                  <XAxis dataKey="jobTitle" interval={0} angle={0} textAnchor="middle" height={34} tickFormatter={(value: string) => ({ "Backend Developer": "Backend", "Data Analyst": "Data", "DevOps Engineer": "DevOps", "Engineering Manager": "Eng. Mgr", "Frontend Developer": "Frontend", "Full Stack Developer": "Full Stack", "Product Manager": "Product", "QA Engineer": "QA", "Software Engineer": "Software", "UI/UX Designer": "UI/UX" }[value] ?? value)} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} axisLine={false} tickLine={false} tickMargin={7} />
                  <YAxis allowDecimals={false} width={34} tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} axisLine={false} tickLine={false} tickMargin={5} />
                  <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.55 }} contentStyle={{ border: "1px solid var(--border)", borderRadius: 9, background: "var(--popover)", color: "var(--popover-foreground)", boxShadow: "0 8px 24px rgb(24 32 56 / 10%)", fontSize: 11 }} formatter={(value) => { const amount = Number(value); return [amount.toLocaleString("en-IN") + " employees · " + (totalRoleEmployees ? (amount / totalRoleEmployees * 100).toFixed(1) : "0.0") + "%", "Workforce"] }} labelFormatter={(label) => String(label)} />
                  <Bar dataKey="employeeCount" name="Employees" maxBarSize={30} radius={[5, 5, 0, 0]} onClick={(entry) => setActiveRole(activeRole === String(entry.jobTitle) ? null : String(entry.jobTitle))} className="cursor-pointer">
                    {roles.map((role, index) => <Cell key={role.jobTitle} fill={COLORS[index % COLORS.length]} opacity={activeRole && activeRole !== role.jobTitle ? 0.28 : 1} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {roles.map((role, index) => { const share = totalRoleEmployees ? role.employeeCount / totalRoleEmployees * 100 : 0; const selected = activeRole === role.jobTitle; return <button type="button" key={role.jobTitle} aria-pressed={selected} onClick={() => setActiveRole(selected ? null : role.jobTitle)} className={"flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors " + (selected ? "bg-accent ring-1 ring-primary/30" : "hover:bg-muted/70")}>
                <span className="size-2 shrink-0 rounded-[2px]" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate text-[10px] text-foreground">{role.jobTitle}</span>
                <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{share.toFixed(1)}%</span>
              </button> })}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <p className="text-[10px] text-muted-foreground">{activeRole ? "Filtered: " + activeRole : "Select a bar or role to filter the table"}</p>
              {activeRole && <button type="button" onClick={() => setActiveRole(null)} className="text-[10px] font-semibold text-primary hover:underline">Clear filter</button>}
            </div>
          </div>}
      </Panel>
    </div>
    <section className="peopleops-data-panel overflow-hidden rounded-[12px] border border-[#E3E7F0] bg-white">
      <header className="flex items-center justify-between gap-3 px-[22px] py-[19px]">
        <div><h2 className="text-[16px] font-semibold tracking-[-0.25px] text-[#292D40]">Compensation by role</h2><p className="mt-[4px] text-[11px] text-[#78839A]">{selectedCountry} · {activeRole ? "Filtered: " + activeRole : roles.length + " job titles"}</p></div>
        <Link to="/employees" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#5146D8] hover:text-[#3F35B8]">View employees <ArrowUpRight className="size-[14px]" /></Link>
      </header>
      {rolesQuery.isPending ? <EmptyState>Loading role details…</EmptyState> : rolesQuery.isError ? <EmptyState>Unable to load compensation details.</EmptyState> : roles.length === 0 ? <EmptyState>No active employees for {selectedCountry}.</EmptyState> :
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead className="bg-[#F7F8FC] text-[9px] font-semibold uppercase text-[#78839A]"><tr><th className="px-[22px] py-[10px]">Job title</th><th className="px-[22px] py-[10px] text-right">Employees</th><th className="px-[22px] py-[10px] text-right">Average annual salary</th></tr></thead>
            <tbody>{roles.filter((role) => !activeRole || role.jobTitle === activeRole).map((role, index) => <tr key={role.jobTitle} className="peopleops-table-row border-t border-[#E3E7F0] hover:bg-[#FAFBFD]"><td className="px-[22px] py-[7px]"><span className="inline-flex items-center gap-[13px] text-[12px] text-[#30354A]"><span className="size-[7px] rounded-[2px]" style={{ background: COLORS[index % COLORS.length] }} />{role.jobTitle}</span></td><td className="px-[22px] py-[7px] text-right text-[12px] text-[#30354A] tabular-nums">{role.employeeCount.toLocaleString("en-IN")}</td><td className="px-[22px] py-[7px] text-right text-[12px] font-medium text-[#30354A] tabular-nums">{money(role.averageSalary, currency)} {currency}</td></tr>)}</tbody>
          </table>
        </div>}
    </section>
  </main>
}
