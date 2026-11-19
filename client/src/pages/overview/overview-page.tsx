import { useState } from "react"
import {
  ArrowDown,
  ChartNoAxesCombined,
  LoaderCircle,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  useJobTitleAverages,
  useSalarySummary,
} from "@/features/analytics/analytics-queries"
import {
  COUNTRIES,
  COUNTRY_CURRENCIES,
  type Country,
} from "@/features/employees/employee-types"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select.tsx"

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const formatMoney = (value: number | string | null | undefined, currency: string) => {
  if (value === null || value === undefined || value === "") return "—"
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "—"
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}
const formatCompactMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value)

type MetricCardProps = { title: string; value: string; detail: string; icon: typeof Users; isLoading?: boolean; accent: string }
const MetricCard = ({ title, value, detail, icon: Icon, isLoading = false, accent }: MetricCardProps) => (
  <section className="overview-metric-card relative overflow-hidden">
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2"><span className="flex items-center justify-center" style={{ color: accent, background: `color-mix(in srgb,${accent} 11%,white)` }}><Icon /></span><p>{title}</p></div>
      <span className="text-muted-foreground"><span aria-hidden="true">⋮</span></span>
    </div>
    <div className="flex min-h-7 items-center">
      {isLoading ? <LoaderCircle className="size-4 animate-spin text-muted-foreground" /> : <p className="tabular-nums">{value}</p>}
    </div>
    <p>{detail}</p>
  </section>
)

const ChartCard = ({ title, description, children, className = "" }: { title: string; description?: string; children: React.ReactNode; className?: string }) => (
  <section className={`overview-chart-card min-w-0 overflow-hidden ${className}`}>
    <div className="flex items-start justify-between gap-3 border-b">
      <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
    </div>
    {children}
  </section>
)
const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex min-h-48 items-center justify-center px-5 text-center text-xs text-muted-foreground">{message}</div>
)

const OverviewPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const { data: salarySummary, isPending: isSummaryPending, isError: isSummaryError, error: summaryError, isFetching: isSummaryFetching, refetch: refetchSummary } = useSalarySummary(selectedCountry)
  const { data: jobAverages, isPending: areJobAveragesPending, isError: areJobAveragesError, error: jobAveragesError, isFetching: areJobAveragesFetching, refetch: refetchJobAverages } = useJobTitleAverages(selectedCountry)
  const isRefreshing = isSummaryFetching || areJobAveragesFetching
  const currency = salarySummary?.currency ?? jobAverages?.currency ?? COUNTRY_CURRENCIES[selectedCountry]
  const money = (value: number | string | null | undefined) => formatMoney(value, currency)
  const handleRefresh = async () => { await Promise.all([refetchSummary(), refetchJobAverages()]) }
  const jobSummaries = jobAverages?.data ?? []
  const workforceTotal = jobSummaries.reduce((total, item) => total + item.employeeCount, 0)
  const summaryErrorMessage = summaryError instanceof Error ? summaryError.message : "An unexpected error occurred."
  const jobAveragesErrorMessage = jobAveragesError instanceof Error ? jobAveragesError.message : "An unexpected error occurred."

  return (
    <div className="peopleops-overview space-y-4">
      <div className="overview-heading flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.15em] text-primary">People operations</div>
          <h1 className="font-heading font-semibold">Good morning 👋</h1>
          <p>Here's what's happening across your people and compensation.</p>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex flex-col justify-end gap-1">
            <label htmlFor="overview-country">Reporting country</label>
            <NativeSelect id="overview-country" value={selectedCountry} onChange={(event) => setSelectedCountry(event.target.value as Country)} className="w-full min-w-40 sm:w-40" size="lg">
              {COUNTRIES.map((country) => <NativeSelectOption key={country} value={country}>{country}</NativeSelectOption>)}
            </NativeSelect>
          </div>
          <button type="button" onClick={() => void handleRefresh()} disabled={isRefreshing} className="inline-flex h-8 items-center gap-2 rounded-md border bg-card px-3 text-[11px] font-medium hover:bg-muted disabled:opacity-50">
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {isSummaryError && <section role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs"><p className="font-semibold">Couldn't load salary statistics</p><p className="mt-1 text-muted-foreground">{summaryErrorMessage}</p><button type="button" onClick={() => void refetchSummary()} className="mt-2 rounded-md border px-3 py-1.5">Retry</button></section>}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
        <MetricCard title="Employees" value={String(salarySummary?.employeeCount.toLocaleString() ?? 0)} detail={`Active employees in ${selectedCountry}`} icon={Users} isLoading={isSummaryPending} accent="var(--chart-1)" />
        <MetricCard title="Minimum salary" value={money(salarySummary?.minSalary)} detail="Annual compensation" icon={ArrowDown} isLoading={isSummaryPending} accent="var(--chart-2)" />
        <MetricCard title="Average salary" value={money(salarySummary?.averageSalary)} detail="Annual compensation" icon={ChartNoAxesCombined} isLoading={isSummaryPending} accent="var(--chart-3)" />
        <MetricCard title="Maximum salary" value={money(salarySummary?.maxSalary)} detail="Annual compensation" icon={Wallet} isLoading={isSummaryPending} accent="var(--chart-4)" />
      </div>

      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(270px,1fr)]">
        <ChartCard title="Average salary by role" description={`Annual compensation in ${currency} · ${selectedCountry}`}>
          {areJobAveragesError ? <ChartEmptyState message={jobAveragesErrorMessage} /> : areJobAveragesPending ? <div className="flex min-h-64 items-center justify-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading salary breakdown...</div> : jobSummaries.length === 0 ? <ChartEmptyState message={`No active employee data for ${selectedCountry} yet.`} /> : (
            <div className="px-3 pb-3 pt-4">
              <div className="w-full" style={{ height: Math.max(240, jobSummaries.length * 34) }}>
                <ResponsiveContainer width="100%" height="100%"><BarChart data={jobSummaries} layout="vertical" margin={{ top: 4, right: 12, bottom: 2, left: 0 }} barCategoryGap={8}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 5" />
                  <XAxis type="number" tickFormatter={(value: number) => formatCompactMoney(value, currency)} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis type="category" dataKey="jobTitle" width={118} interval={0} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--muted)", opacity: .55 }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)", fontSize: 11 }} formatter={(value) => [money(Number(value)), "Average salary"]} />
                  <Bar dataKey="averageSalary" name="Average salary" fill="var(--chart-1)" radius={[3, 3, 3, 3]} maxBarSize={17} />
                </BarChart></ResponsiveContainer>
              </div>
            </div>
          )}
        </ChartCard>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <ChartCard title="Workforce mix" description={`Employees by job title · ${selectedCountry}`}>
            {areJobAveragesError ? <ChartEmptyState message={jobAveragesErrorMessage} /> : areJobAveragesPending ? <div className="flex min-h-48 items-center justify-center text-xs text-muted-foreground">Loading workforce mix...</div> : workforceTotal === 0 ? <ChartEmptyState message="No workforce data to display yet." /> : (
              <div className="px-4 pb-4 pt-2">
                <div className="relative mx-auto h-40 max-w-52">
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={jobSummaries} dataKey="employeeCount" nameKey="jobTitle" innerRadius="66%" outerRadius="88%" paddingAngle={2} stroke="var(--card)" strokeWidth={2}>{jobSummaries.map((item,index)=><Cell key={item.jobTitle} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background:"var(--popover)",border:"1px solid var(--border)",borderRadius:8,color:"var(--popover-foreground)",fontSize:11 }} formatter={(value,_name,item)=>[Number(value).toLocaleString(),item.payload.jobTitle]} /></PieChart></ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">{workforceTotal.toLocaleString()}</span><span className="text-[10px] text-muted-foreground">employees</span></div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                  {jobSummaries.map((item,index)=><div key={item.jobTitle} className="flex min-w-0 items-center justify-between gap-2 text-[10px]"><span className="flex min-w-0 items-center gap-1.5"><span className="size-2 shrink-0 rounded-sm" style={{background:CHART_COLORS[index % CHART_COLORS.length]}}/><span className="truncate text-muted-foreground">{item.jobTitle}</span></span><span className="shrink-0 font-semibold tabular-nums">{item.employeeCount.toLocaleString()}</span></div>)}
                </div>
              </div>
            )}
          </ChartCard>

          <ChartCard title="Salary snapshot" description="Compensation range for the selected country">
            <div className="space-y-3 px-4 py-4">
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Minimum</span><strong className="font-semibold tabular-nums">{money(salarySummary?.minSalary)}</strong></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]"><div className="h-full w-2/3 rounded-full bg-[#73BC91]" /></div>
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Average</span><strong className="font-semibold tabular-nums">{money(salarySummary?.averageSalary)}</strong></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]"><div className="h-full w-4/5 rounded-full bg-[#5687F3]" /></div>
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Maximum</span><strong className="font-semibold tabular-nums">{money(salarySummary?.maxSalary)}</strong></div>
              <p className="border-t pt-2 text-[10px] text-muted-foreground">Annual salary · {currency} · deleted employees excluded</p>
            </div>
          </ChartCard>
        </div>
      </div>

      <section className="overview-data-table overflow-hidden">
        <div className="flex flex-col gap-2 border-b sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-heading">Role-level compensation details</h2><p className="mt-1 text-sm text-muted-foreground">Employee counts and average annual salary by job title.</p></div>
          <span className="w-fit rounded-md bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">{selectedCountry} · {currency}</span>
        </div>
        {areJobAveragesError ? <div role="alert" className="px-5 py-8 text-center text-xs"><p className="font-medium">Couldn't load job-title averages</p><p className="mt-1 text-muted-foreground">{jobAveragesErrorMessage}</p><button type="button" onClick={() => void refetchJobAverages()} className="mt-3 rounded-md border px-3 py-1.5">Try again</button></div> : areJobAveragesPending ? <div className="flex min-h-32 items-center justify-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading role details...</div> : jobSummaries.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full min-w-100 text-left text-xs"><thead><tr><th className="px-4 py-2.5 font-medium">Job title</th><th className="px-4 py-2.5 text-right font-medium">Employees</th><th className="px-4 py-2.5 text-right font-medium">Average salary</th></tr></thead><tbody className="divide-y">{jobSummaries.map(summary=><tr key={summary.jobTitle} className="transition-colors hover:bg-muted/30"><td className="px-4 py-3 font-medium">{summary.jobTitle}</td><td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{summary.employeeCount.toLocaleString()}</td><td className="px-4 py-3 text-right font-medium tabular-nums">{money(summary.averageSalary)}</td></tr>)}</tbody></table></div>
        ) : <div className="px-5 py-10 text-center text-xs"><p className="font-medium">No employee data available</p><p className="mt-1 text-muted-foreground">There are no active employees for {selectedCountry} yet.</p></div>}
        <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-[10px] text-muted-foreground">Salary values are annual and shown only in {currency}. Deleted employees are excluded.</div>
      </section>
    </div>
  )
}
export default OverviewPage
