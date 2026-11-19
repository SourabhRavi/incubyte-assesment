import { useMemo, useState, type ComponentType, type ReactNode } from "react"
import { ArrowUpRight, Globe2, LoaderCircle, RefreshCw, Users, Wallet, ChartNoAxesCombined } from "lucide-react"
import { Link } from "react-router"
import { useAllSalarySummaries, useJobTitleAverages, useSalarySummary } from "@/features/analytics/analytics-queries"
import { COUNTRIES, COUNTRY_CURRENCIES, type Country } from "@/features/employees/employee-types"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select.tsx"

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
  return <section className="min-w-0 rounded-[8px] border border-[#E3E7F0] bg-white px-[18px] py-[18px]">
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
  return <section className={`min-w-0 overflow-hidden rounded-[12px] border border-[#E3E7F0] bg-white ${className}`}>
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
  const allMarkets = useAllSalarySummaries()
  const summaryQuery = useSalarySummary(selectedCountry)
  const rolesQuery = useJobTitleAverages(selectedCountry)
  const summary = summaryQuery.data
  const roles = rolesQuery.data?.data ?? []
  const currency = summary?.currency ?? rolesQuery.data?.currency ?? COUNTRY_CURRENCIES[selectedCountry]
  const count = summary?.employeeCount ?? roles.reduce((total, role) => total + role.employeeCount, 0)
  const min = Number(summary?.minSalary ?? 0)
  const avg = Number(summary?.averageSalary ?? 0)
  const max = Number(summary?.maxSalary ?? 0)
  const maxRole = Math.max(1, ...roles.map((role) => Number(role.averageSalary)))
  const totalRoleEmployees = roles.reduce((total, role) => total + role.employeeCount, 0)
  const isRefreshing = summaryQuery.isFetching || rolesQuery.isFetching || allMarkets.some((query) => query.isFetching)
  const refresh = async () => {
    await Promise.all([summaryQuery.refetch(), rolesQuery.refetch(), ...allMarkets.map((query) => query.refetch())])
  }
  const donut = useMemo(() => {
    const total = roles.reduce((sum, role) => sum + role.employeeCount, 0)
    const circumference = 2 * Math.PI * 57
    let offset = 0
    return roles.map((role, index) => {
      const length = total ? (role.employeeCount / total) * circumference : 0
      const segment = { ...role, color: COLORS[index % COLORS.length], dash: `${Math.max(0, length - 1.5)} ${circumference}`, offset: -offset, percent: total ? Math.round((role.employeeCount / total) * 100) : 0 }
      offset += length
      return segment
    })
  }, [roles])

  return <main className="mx-auto w-full max-w-[1440px] space-y-[23px] px-[26px] pb-12 pt-[31px] max-sm:px-4">
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
        <label className="relative">
          <span className="sr-only">Reporting country</span>
          <Globe2 className="pointer-events-none absolute left-[15px] top-1/2 size-[16px] -translate-y-1/2 text-[#5146D8]" />
          <NativeSelect id="overview-country" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value as Country)} className="h-[43px] w-[199px] rounded-[8px] border-[#E3E7F0] bg-white pl-[39px] pr-8 text-[12px] font-semibold text-[#30354A]">
            {COUNTRIES.map((country) => <NativeSelectOption key={country} value={country}>{country}</NativeSelectOption>)}
          </NativeSelect>
        </label>
        <button type="button" onClick={() => void refresh()} disabled={isRefreshing} className="inline-flex h-[43px] items-center gap-2 rounded-[8px] border border-[#E3E7F0] bg-white px-[14px] text-[12px] font-medium text-[#30354A] hover:bg-[#F8F9FC] disabled:opacity-60">
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
      <Panel title="Average salary by role" subtitle={`Annual compensation · ${currency}`}>
        {rolesQuery.isPending ? <EmptyState>Loading salary breakdown…</EmptyState> : rolesQuery.isError ? <EmptyState>Unable to load role salary data.</EmptyState> : roles.length === 0 ? <EmptyState>No active employee data for {selectedCountry} yet.</EmptyState> :
          <div className="px-[22px] pb-[16px] pt-[28px]">
            <div className="space-y-[21px]">
              {roles.map((role, index) => <div key={role.jobTitle} className="grid grid-cols-[105px_minmax(0,1fr)_108px] items-center gap-3 max-sm:grid-cols-[78px_minmax(0,1fr)]">
                <span className="truncate text-[12px] font-medium text-[#30354A]">{role.jobTitle}</span>
                <div className="h-[16px] overflow-hidden rounded-[4px] bg-[#F4F5FA]">
                  <div className="h-full rounded-[4px]" style={{ width: `${Math.max(2, (Number(role.averageSalary) / maxRole) * 100)}%`, background: index === 0 ? "#5146D8" : "#EDEBFF" }} />
                </div>
                <span className="text-right text-[12px] font-semibold text-[#30354A] tabular-nums max-sm:col-start-2 max-sm:text-left">{money(role.averageSalary, currency)}</span>
              </div>)}
            </div>
            <div className="ml-[118px] mr-[108px] mt-[31px] flex justify-between text-[9px] text-[#78839A] max-sm:ml-[90px] max-sm:mr-0">
              <span>{compactMoney(0, currency)}</span><span>{compactMoney(maxRole / 3, currency)}</span><span>{compactMoney((maxRole * 2) / 3, currency)}</span><span>{compactMoney(maxRole, currency)}</span>
            </div>
          </div>}
      </Panel>

      <Panel title="Workforce mix" subtitle={`Employees by job title · ${selectedCountry}`}>
        {rolesQuery.isPending ? <EmptyState>Loading workforce mix…</EmptyState> : rolesQuery.isError || roles.length === 0 ? <EmptyState>No workforce data to display yet.</EmptyState> :
          <div className="flex min-h-[280px] items-center justify-center gap-5 px-5 pb-5 pt-7 max-sm:flex-col">
            <div className="relative h-[184px] w-[184px] shrink-0">
              <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={`Workforce distribution across ${roles.length} job titles`}>
                <circle cx="80" cy="80" r="57" fill="none" stroke="#F0F1F6" strokeWidth="17" />
                {donut.map((segment) => <circle key={segment.jobTitle} cx="80" cy="80" r="57" fill="none" stroke={segment.color} strokeWidth="17" strokeDasharray={segment.dash} strokeDashoffset={segment.offset} />)}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-[27px] font-semibold tracking-[-0.8px] text-[#292D40] tabular-nums">{totalRoleEmployees.toLocaleString("en-IN")}</strong>
                <span className="mt-1 text-[10px] text-[#78839A]">employees</span>
              </div>
            </div>
            <div className="min-w-[145px] space-y-[11px]">
              {donut.map((item) => <div key={item.jobTitle} className="flex items-start gap-[11px]">
                <span className="mt-[4px] size-[8px] shrink-0 rounded-[2px]" style={{ background: item.color }} />
                <div className="min-w-0"><p className="text-[12px] font-medium leading-[1.2] text-[#30354A]">{item.jobTitle}</p><p className="mt-[3px] text-[10px] text-[#78839A]">{item.employeeCount.toLocaleString("en-IN")} · {item.percent}%</p></div>
              </div>)}
            </div>
          </div>}
      </Panel>
    </div>

    <section className="overflow-hidden rounded-[12px] border border-[#E3E7F0] bg-white">
      <header className="flex items-center justify-between gap-3 px-[22px] py-[19px]">
        <div><h2 className="text-[16px] font-semibold tracking-[-0.25px] text-[#292D40]">Compensation by role</h2><p className="mt-[4px] text-[11px] text-[#78839A]">{selectedCountry} · {roles.length} job titles</p></div>
        <Link to="/employees" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#5146D8] hover:text-[#3F35B8]">View employees <ArrowUpRight className="size-[14px]" /></Link>
      </header>
      {rolesQuery.isPending ? <EmptyState>Loading role details…</EmptyState> : rolesQuery.isError ? <EmptyState>Unable to load compensation details.</EmptyState> : roles.length === 0 ? <EmptyState>No active employees for {selectedCountry}.</EmptyState> :
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead className="bg-[#F7F8FC] text-[9px] font-semibold uppercase text-[#78839A]"><tr><th className="px-[22px] py-[10px]">Job title</th><th className="px-[22px] py-[10px] text-right">Employees</th><th className="px-[22px] py-[10px] text-right">Average annual salary</th></tr></thead>
            <tbody>{roles.map((role, index) => <tr key={role.jobTitle} className="border-t border-[#E3E7F0] hover:bg-[#FAFBFD]"><td className="px-[22px] py-[7px]"><span className="inline-flex items-center gap-[13px] text-[12px] text-[#30354A]"><span className="size-[7px] rounded-[2px]" style={{ background: COLORS[index % COLORS.length] }} />{role.jobTitle}</span></td><td className="px-[22px] py-[7px] text-right text-[12px] text-[#30354A] tabular-nums">{role.employeeCount.toLocaleString("en-IN")}</td><td className="px-[22px] py-[7px] text-right text-[12px] font-medium text-[#30354A] tabular-nums">{money(role.averageSalary, currency)} {currency}</td></tr>)}</tbody>
          </table>
        </div>}
    </section>
  </main>
}
