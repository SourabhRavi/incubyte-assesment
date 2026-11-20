import { useState, type ComponentType, type ReactNode } from "react"
import {
  ArrowUpRight,
  Globe,
  LoaderCircle,
  RefreshCw,
  Users,
  Wallet,
  X,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Link } from "react-router"
import {
  useAllSalarySummaries,
  useJobTitleAverages,
  useSalarySummary,
} from "@/features/analytics/analytics-queries"
import {
  COUNTRIES,
  COUNTRY_CURRENCIES,
  type Country,
} from "@/features/employees/employee-types"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
]
const money = (value: number | string | null | undefined, currency: string) => {
  if (value === null || value === undefined || value === "") return "—"
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
const compactMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value)

type MetricProps = {
  title: string
  value: string
  detail: string
  icon: ComponentType<{ className?: string }>
  loading?: boolean
  highlighted?: boolean
}
function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  loading,
  highlighted,
}: MetricProps) {
  return (
    <section className="peopleops-metric min-w-0 rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-[18px] py-[18px]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-[var(--muted-foreground)]">{title}</p>
        <Icon
          className={`size-[17px] ${highlighted ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}
        />
      </div>
      <div className="mt-[17px] flex min-h-[37px] items-center">
        {loading ? (
          <LoaderCircle className="size-5 animate-spin text-[var(--muted-foreground)]" />
        ) : (
          <p className="truncate text-[28px] leading-none font-semibold tracking-[-0.8px] text-[var(--foreground)] tabular-nums">
            {value}
          </p>
        )}
      </div>
      <p className="mt-[11px] text-[11px] text-[var(--muted-foreground)]">{detail}</p>
    </section>
  )
}
function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string
  subtitle: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`peopleops-chart-panel min-w-0 overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card)] ${className}`}
    >
      <header className="px-[22px] pt-[20px]">
        <h2 className="text-[16px] font-semibold tracking-[-0.25px] text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-[5px] text-[12px] text-[var(--muted-foreground)]">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}
function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[210px] items-center justify-center px-6 text-center text-[12px] text-[var(--muted-foreground)]">
      {children}
    </div>
  )
}

export default function OverviewPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const [salaryFocusRole, setSalaryFocusRole] = useState<string | null>(null)
  const [salaryHoveredRole, setSalaryHoveredRole] = useState<string | null>(null)
  const [workforceFocusRole, setWorkforceFocusRole] = useState<string | null>(null)
  const [workforceHoveredRole, setWorkforceHoveredRole] = useState<string | null>(null)
  const salaryHighlightedRole = salaryFocusRole ?? salaryHoveredRole
  const workforceHighlightedRole = workforceFocusRole ?? workforceHoveredRole
  const allMarkets = useAllSalarySummaries()
  const summaryQuery = useSalarySummary(selectedCountry)
  const rolesQuery = useJobTitleAverages(selectedCountry)
  const summary = summaryQuery.data
  const roles = rolesQuery.data?.data ?? []
  const currency =
    summary?.currency ??
    rolesQuery.data?.currency ??
    COUNTRY_CURRENCIES[selectedCountry]
  const count =
    summary?.employeeCount ??
    roles.reduce((total, role) => total + role.employeeCount, 0)
  const totalRoleEmployees = roles.reduce(
    (total, role) => total + role.employeeCount,
    0
  )
  const isRefreshing =
    summaryQuery.isFetching ||
    rolesQuery.isFetching ||
    allMarkets.some((query) => query.isFetching)
  const refresh = async () => {
    await Promise.all([
      summaryQuery.refetch(),
      rolesQuery.refetch(),
      ...allMarkets.map((query) => query.refetch()),
    ])
  }
  return (
    <main className="peopleops-overview w-full space-y-[23px] px-[26px] pt-[31px] pb-12 max-sm:px-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[1.2] font-semibold tracking-[-0.8px] text-[var(--foreground)]">
            People overview
          </h1>
          <p className="mt-[10px] text-[14px] text-[var(--muted-foreground)]">
            A clear view of your workforce and compensation.
          </p>
          <div className="mt-[15px] flex flex-wrap items-center gap-3">
            <span className="rounded-[5px] bg-[var(--secondary)] px-[10px] py-[6px] text-[9px] font-semibold tracking-[0.02em] text-[var(--primary)]">
              {selectedCountry.toUpperCase()} / {currency} · ANNUAL
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)]">
              Salary figures reflect {selectedCountry} only. Sample data.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-[1px]">
          <div className="peopleops-country-select relative">
            <Globe
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-[14px] z-[1] size-[16px] -translate-y-1/2 text-[var(--primary)]"
            />
            <NativeSelect
              id="overview-country"
              aria-label="Reporting country"
              value={selectedCountry}
              onChange={(event) => {
                setSelectedCountry(event.target.value as Country)
                setSalaryFocusRole(null)
                setSalaryHoveredRole(null)
                setWorkforceFocusRole(null)
                setWorkforceHoveredRole(null)
              }}
              selectClassName="h-[43px] w-full rounded-[8px] border-[var(--border)] bg-[var(--card)] pl-[40px] pr-9 text-[12px] font-semibold text-[var(--foreground)] shadow-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/15"
            >
              {COUNTRIES.map((country) => (
                <NativeSelectOption key={country} value={country}>
                  {country}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="peopleops-action-button inline-flex h-[43px] items-center gap-2 rounded-[8px] border border-[var(--border)] bg-[var(--card)] px-[14px] text-[12px] font-medium text-[var(--foreground)] hover:bg-[var(--hover-surface)] disabled:opacity-60"
          >
            <RefreshCw
              className={`size-[14px] ${isRefreshing ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>
        </div>
      </div>

      {(summaryQuery.isError || rolesQuery.isError) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800"
        >
          Some compensation data could not be loaded.{" "}
          <button className="ml-2 underline" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Total employees"
          value={summaryQuery.isPending ? "—" : count.toLocaleString("en-IN")}
          detail={`${selectedCountry} · people`}
          icon={Users}
          loading={summaryQuery.isPending}
        />
        <MetricCard
          title="Minimum salary"
          value={money(summary?.minSalary, currency)}
          detail={`${selectedCountry} · ${currency} / year`}
          icon={Wallet}
          loading={summaryQuery.isPending}
        />
        <MetricCard
          title="Average salary"
          value={money(summary?.averageSalary, currency)}
          detail={`${selectedCountry} · ${currency} / year`}
          icon={Wallet}
          highlighted
          loading={summaryQuery.isPending}
        />
        <MetricCard
          title="Maximum salary"
          value={money(summary?.maxSalary, currency)}
          detail={`${selectedCountry} · ${currency} / year`}
          icon={Wallet}
          loading={summaryQuery.isPending}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.18fr_0.88fr]">
        <Panel
          title="Average salary by role"
          subtitle={"Annual compensation · " + currency}
          className="flex h-full flex-col"
        >
          {rolesQuery.isPending ? (
            <EmptyState>Loading salary breakdown…</EmptyState>
          ) : rolesQuery.isError ? (
            <EmptyState>Unable to load role salary data.</EmptyState>
          ) : roles.length === 0 ? (
            <EmptyState>
              No active employee data for {selectedCountry} yet.
            </EmptyState>
          ) : (
            <div className="peopleops-chart-body flex flex-1 flex-col px-5 pt-4 pb-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  Average annual salary by job title
                </span>
                {salaryFocusRole && (
                  <button
                    type="button"
                    onClick={() => setSalaryFocusRole(null)}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--primary)] hover:underline"
                  >
                    Clear focus <X className="size-3" />
                  </button>
                )}
              </div>
              {(() => {
                const maxSalary = Math.max(
                  ...roles.map((role) => Number(role.averageSalary ?? 0)),
                  1
                )
                const axisMax = Math.ceil(maxSalary / 500000) * 500000
                const ticks = [0, 0.25, 0.5, 0.75, 1]
                return (
                  <>
                    <div className="flex flex-1 flex-col justify-between gap-2">
                      {roles.map((role, index) => {
                        const averageSalary = Number(role.averageSalary ?? 0)
                        const isFocused = salaryHighlightedRole === role.jobTitle
                        const isDimmed = Boolean(salaryHighlightedRole && !isFocused)
                        return (
                          <button
                            key={role.jobTitle}
                            type="button"
                            onClick={() =>
                              setSalaryFocusRole(salaryFocusRole === role.jobTitle ? null : role.jobTitle)
                            }
                            onMouseEnter={() => setSalaryHoveredRole(role.jobTitle)}
                            onMouseLeave={() => setSalaryHoveredRole(null)}
                            aria-label={`${role.jobTitle}, average annual salary ${money(role.averageSalary, currency)}. Select to focus this role.`}
                            aria-pressed={salaryFocusRole === role.jobTitle}
                            className={`group grid w-full grid-cols-[minmax(112px,150px)_minmax(0,1fr)_minmax(92px,112px)] items-center gap-3 rounded-lg border px-2 py-2 text-left transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:outline-none ${isFocused ? "border-[var(--primary)]/30 bg-[var(--active-surface)] shadow-sm" : "border-transparent hover:border-[var(--border)] hover:bg-[var(--hover-surface)]"}`}
                          >
                            <span
                              className={`truncate text-[11px] font-medium ${isDimmed ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}
                            >
                              {role.jobTitle}
                            </span>
                            <span className={`relative block h-5 min-w-0 overflow-hidden rounded-[5px] bg-[var(--muted)] transition-shadow ${isFocused ? "ring-2 ring-[var(--primary)]/25" : ""}`}>
                              <span
                                className="absolute inset-y-0 left-0 rounded-[5px] transition-[width,opacity] duration-300"
                                style={{
                                  width: `${Math.max(2, (averageSalary / axisMax) * 100)}%`,
                                  backgroundColor: COLORS[index % COLORS.length],
                                  opacity: isDimmed ? 0.22 : 1,
                                  boxShadow: isFocused ? "0 0 0 2px color-mix(in srgb, var(--primary) 18%, transparent)" : "none",
                                  filter: isFocused ? "saturate(1.15)" : "none",
                                }}
                              />
                            </span>
                            <span
                              className={`text-right text-[10px] font-semibold whitespace-nowrap tabular-nums ${isDimmed ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}
                            >
                              {money(role.averageSalary, currency)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3 grid grid-cols-[minmax(112px,150px)_minmax(0,1fr)_minmax(92px,112px)] items-start gap-3 border-t border-[var(--border)] pt-2">
                      <span />
                      <div className="flex justify-between text-[9px] text-[var(--muted-foreground)] tabular-nums">
                        {ticks.map((tick) => (
                          <span key={tick}>
                            {compactMoney(axisMax * tick, currency)}
                          </span>
                        ))}
                      </div>
                      <span />
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </Panel>

        <Panel
          title="Workforce mix"
          subtitle={"Active employees by job title · " + selectedCountry}
          className="flex h-full flex-col"
        >
          {rolesQuery.isPending ? (
            <EmptyState>Loading workforce mix…</EmptyState>
          ) : rolesQuery.isError || roles.length === 0 ? (
            <EmptyState>No workforce data to display yet.</EmptyState>
          ) : (
            <div className="peopleops-chart-body flex flex-1 min-h-0 flex-col px-4 pt-4 pb-4">
              <div className="mb-2 flex items-center justify-between gap-3 px-1">
                <span className="text-[10px] text-muted-foreground">
                  Employee distribution
                </span>
                <span className="text-[10px] font-semibold text-foreground tabular-nums">
                  {totalRoleEmployees.toLocaleString("en-IN")} employees
                </span>
              </div>
              <div className="min-h-[300px] w-full min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                  <BarChart
                    data={roles}
                    margin={{ top: 12, right: 4, bottom: 12, left: 0 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--border)"
                      strokeDasharray="3 4"
                    />
                    <XAxis
                      dataKey="jobTitle"
                      interval={0}
                      angle={0}
                      textAnchor="middle"
                      height={34}
                      tickFormatter={(value: string) => {
                        const labels: Record<string, string> = {
                          "Backend Developer": "Backend",
                          "Data Analyst": "Data",
                          "DevOps Engineer": "DevOps",
                          "Engineering Manager": "Eng. Mgr",
                          "Frontend Developer": "Frontend",
                          "Full Stack Developer": "Full Stack",
                          "Product Manager": "Product",
                          "QA Engineer": "QA",
                          "Software Engineer": "Software",
                          "UI/UX Designer": "UI/UX",
                        }
                        return labels[value] ?? value
                      }}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={7}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={34}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={5}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.55 }}
                      contentStyle={{
                        border: "1px solid var(--border)",
                        borderRadius: 9,
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                        boxShadow: "0 8px 24px rgb(24 32 56 / 10%)",
                        fontSize: 11,
                      }}
                      formatter={(value) => {
                        const amount = Number(value)
                        return [
                          amount.toLocaleString("en-IN") +
                            " employees · " +
                            (totalRoleEmployees
                              ? ((amount / totalRoleEmployees) * 100).toFixed(1)
                              : "0.0") +
                            "%",
                          "Workforce",
                        ]
                      }}
                      labelFormatter={(label) => String(label)}
                    />
                    <Bar
                      dataKey="employeeCount"
                      name="Employees"
                      maxBarSize={42}
                      radius={[5, 5, 0, 0]}
                      onClick={(_, index) => {
                        const role = roles[index]
                        if (!role) return
                        setWorkforceFocusRole(
                          workforceFocusRole === role.jobTitle
                            ? null
                            : role.jobTitle
                        )
                      }}
                      className="cursor-pointer"
                    >
                      {roles.map((role, index) => (
                        <Cell
                          key={role.jobTitle}
                          fill={COLORS[index % COLORS.length]}
                          opacity={workforceHighlightedRole && workforceHighlightedRole !== role.jobTitle ? 0.22 : 1}
                          onMouseEnter={() => setWorkforceHoveredRole(role.jobTitle)}
                          onMouseLeave={() => setWorkforceHoveredRole(null)}
                          cursor="pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {roles.map((role, index) => {
                  const share = totalRoleEmployees
                    ? (role.employeeCount / totalRoleEmployees) * 100
                    : 0
                  const selected = workforceHighlightedRole === role.jobTitle
                  const pinned = workforceFocusRole === role.jobTitle
                  return (
                    <button
                      type="button"
                      key={role.jobTitle}
                      aria-pressed={pinned}
                      onClick={() => setWorkforceFocusRole(pinned ? null : role.jobTitle)}
                      onMouseEnter={() => setWorkforceHoveredRole(role.jobTitle)}
                      onMouseLeave={() => setWorkforceHoveredRole(null)}
                      className={
                        "flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-all " +
                        (selected
                          ? "border-[var(--primary)]/25 bg-[var(--active-surface)] text-[var(--foreground)]"
                          : "border-transparent hover:border-[var(--border)] hover:bg-[var(--hover-surface)]")
                      }
                    >
                      <span
                        className="size-2 shrink-0 rounded-[2px]"
                        style={{ background: COLORS[index % COLORS.length] }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[10px] text-foreground">
                        {role.jobTitle}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                        {share.toFixed(1)}%
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <p className="text-[10px] text-muted-foreground">
                  {workforceFocusRole
                    ? "Focused: " + workforceFocusRole
                    : "Select a bar or role to highlight workforce mix"}
                </p>
                {workforceFocusRole && (
                  <button
                    type="button"
                    onClick={() => setWorkforceFocusRole(null)}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          )}
        </Panel>
      </div>
      <section className="peopleops-data-panel overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card)]">
        <header className="flex items-center justify-between gap-3 px-[22px] py-[19px]">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.25px] text-[var(--foreground)]">
              Compensation by role
            </h2>
            <p className="mt-[4px] text-[11px] text-[var(--muted-foreground)]">
              {selectedCountry} ·{" "}
              {roles.length + " job titles"}
            </p>
          </div>
          <Link
            to="/employees"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--primary)] hover:text-[var(--primary)]"
          >
            View employees <ArrowUpRight className="size-[14px]" />
          </Link>
        </header>
        {rolesQuery.isPending ? (
          <EmptyState>Loading role details…</EmptyState>
        ) : rolesQuery.isError ? (
          <EmptyState>Unable to load compensation details.</EmptyState>
        ) : roles.length === 0 ? (
          <EmptyState>No active employees for {selectedCountry}.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead className="bg-[var(--surface-subtle)] text-[9px] font-semibold text-[var(--muted-foreground)] uppercase">
                <tr>
                  <th className="px-[22px] py-[10px]">Job title</th>
                  <th className="px-[22px] py-[10px] text-right">Employees</th>
                  <th className="px-[22px] py-[10px] text-right">
                    Average annual salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, index) => (
                    <tr
                      key={role.jobTitle}
                      className="peopleops-table-row border-t border-[var(--border)] hover:bg-[var(--hover-surface)]"
                    >
                      <td className="px-[22px] py-[7px]">
                        <span className="inline-flex items-center gap-[13px] text-[12px] text-[var(--foreground)]">
                          <span
                            className="size-[7px] rounded-[2px]"
                            style={{
                              background: COLORS[index % COLORS.length],
                            }}
                          />
                          {role.jobTitle}
                        </span>
                      </td>
                      <td className="px-[22px] py-[7px] text-right text-[12px] text-[var(--foreground)] tabular-nums">
                        {role.employeeCount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-[22px] py-[7px] text-right text-[12px] font-medium text-[var(--foreground)] tabular-nums">
                        {money(role.averageSalary, currency)} {currency}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
