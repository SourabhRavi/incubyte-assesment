import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowDown,
  ChartNoAxesCombined,
  LoaderCircle,
  RefreshCw,
  Globe2,
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

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const getLocale = (currency: string) =>
  currency === "INR" ? "en-IN" : "en-US"

const formatMoney = (
  value: number | string | null | undefined,
  currency: string
) => {
  if (value === null || value === undefined || value === "") return "—"

  const amount = Number(value)
  if (!Number.isFinite(amount)) return "—"

  return new Intl.NumberFormat(getLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatCompactMoney = (value: number, currency: string) =>
  new Intl.NumberFormat(getLocale(currency), {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)

type MetricCardProps = {
  title: string
  value: string
  detail: string
  icon: typeof Users
  isLoading?: boolean
  isUnavailable?: boolean
}

const MetricCard = ({
  title,
  value,
  detail,
  icon: Icon,
  isLoading = false,
  isUnavailable = false,
}: MetricCardProps) => (
  <section className="flex h-[136px] min-w-0 flex-col rounded-lg border border-border bg-card px-[19px] py-[18px]">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
      <Icon className="size-[17px] shrink-0 text-primary" strokeWidth={1.8} />
    </div>
    <div className="mt-3 flex min-h-10 items-center">
      {isLoading ? (
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <p className={`truncate font-heading text-[28px] leading-tight font-semibold tracking-tight tabular-nums ${isUnavailable ? "text-muted-foreground" : "text-foreground"}`}>
          {value}
        </p>
      )}
    </div>
    <p className="mt-auto text-[11px] text-muted-foreground">{detail}</p>
  </section>
)

const ChartCard = ({
  title,
  description,
  children,
  className = "",
}: {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) => (
  <section className={`min-w-0 overflow-hidden rounded-xl border border-border bg-card ${className}`}>
    <div className="px-6 pt-5">
      <h2 className="font-heading text-[17px] font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
    {children}
  </section>
)

const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex min-h-[270px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
    {message}
  </div>
)

const OverviewPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])

  const {
    data: salarySummary,
    isPending: isSummaryPending,
    isError: isSummaryError,
    error: summaryError,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useSalarySummary(selectedCountry)

  const {
    data: jobAverages,
    isPending: areJobAveragesPending,
    isError: areJobAveragesError,
    error: jobAveragesError,
    isFetching: areJobAveragesFetching,
    refetch: refetchJobAverages,
  } = useJobTitleAverages(selectedCountry)

  const isRefreshing = isSummaryFetching || areJobAveragesFetching
  const currency =
    salarySummary?.currency ??
    jobAverages?.currency ??
    COUNTRY_CURRENCIES[selectedCountry]

  const money = (value: number | string | null | undefined) =>
    formatMoney(value, currency)

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchJobAverages()])
  }

  const jobSummaries = jobAverages?.data ?? []
  const workforceTotal = jobSummaries.reduce(
    (total, item) => total + item.employeeCount,
    0
  )

  const summaryErrorMessage =
    summaryError instanceof Error
      ? summaryError.message
      : "An unexpected error occurred."

  const jobAveragesErrorMessage =
    jobAveragesError instanceof Error
      ? jobAveragesError.message
      : "An unexpected error occurred."

  const employeeCountValue = isSummaryError
    ? "Unavailable"
    : salarySummary
      ? salarySummary.employeeCount.toLocaleString()
      : "—"

  return (
    <main className="space-y-6 p-5 sm:p-7 lg:px-10 lg:py-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-[28px] leading-tight font-semibold tracking-tight">
            People overview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A clear view of your workforce and compensation.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-6 items-center rounded-[5px] bg-accent px-[10px] text-[10px] font-semibold tracking-wide text-primary">
              {selectedCountry.toUpperCase()} / {currency} · ANNUAL
            </span>
            <span className="text-[11px] text-muted-foreground">
              Salary figures reflect {selectedCountry} only.
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="relative">
            <Globe2 className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-primary" />
            <label htmlFor="overview-country" className="sr-only">
              Reporting country
            </label>
            <NativeSelect
              id="overview-country"
              value={selectedCountry}
              onChange={(event) =>
                setSelectedCountry(event.target.value as Country)
              }
              className="h-11 w-full min-w-[204px] border-border bg-card pl-10 text-[13px] font-semibold sm:w-[204px]"
              size="lg"
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
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {isSummaryError && (
        <section
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="text-sm font-semibold">Couldn't load salary statistics</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {summaryErrorMessage}
          </p>
          <button
            type="button"
            onClick={() => void refetchSummary()}
            className="mt-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total employees"
          value={employeeCountValue}
          detail={isSummaryError ? "Statistics unavailable" : `${selectedCountry} · people`}
          icon={Users}
          isLoading={isSummaryPending}
          isUnavailable={isSummaryError}
        />
        <MetricCard
          title="Minimum salary"
          value={isSummaryError ? "Unavailable" : money(salarySummary?.minSalary)}
          detail={`${selectedCountry} · ${currency} / year`}
          icon={Wallet}
          isLoading={isSummaryPending}
          isUnavailable={isSummaryError}
        />
        <MetricCard
          title="Average salary"
          value={isSummaryError ? "Unavailable" : money(salarySummary?.averageSalary)}
          detail={`${selectedCountry} · ${currency} / year`}
          icon={ChartNoAxesCombined}
          isLoading={isSummaryPending}
          isUnavailable={isSummaryError}
        />
        <MetricCard
          title="Maximum salary"
          value={isSummaryError ? "Unavailable" : money(salarySummary?.maxSalary)}
          detail={`${selectedCountry} · ${currency} / year`}
          icon={ArrowDown}
          isLoading={isSummaryPending}
          isUnavailable={isSummaryError}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,1fr)]">
        <ChartCard
          title="Average salary by role"
          description={`Annual compensation · ${currency}`}
          className="min-h-[356px]"
        >
          {areJobAveragesError ? (
            <ChartEmptyState message={jobAveragesErrorMessage} />
          ) : areJobAveragesPending ? (
            <div className="flex min-h-[285px] items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading salary breakdown...
            </div>
          ) : jobSummaries.length === 0 ? (
            <ChartEmptyState message={`No active employee data for ${selectedCountry} yet.`} />
          ) : (
            <div className="px-4 pb-4 pt-5 sm:px-6">
              <div
                className="w-full"
                style={{ height: Math.max(270, jobSummaries.length * 42) }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobSummaries}
                    layout="vertical"
                    margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                    barCategoryGap={12}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="var(--border)"
                      strokeDasharray="3 5"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(value: number) =>
                        formatCompactMoney(value, currency)
                      }
                      tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                    />
                    <YAxis
                      type="category"
                      dataKey="jobTitle"
                      width={112}
                      interval={0}
                      tick={{ fill: "var(--foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.45 }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        color: "var(--popover-foreground)",
                        fontSize: 12,
                      }}
                      formatter={(value) => [
                        money(Number(value)),
                        "Average salary",
                      ]}
                    />
                    <Bar
                      dataKey="averageSalary"
                      name="Average salary"
                      radius={[0, 5, 5, 0]}
                      maxBarSize={16}
                    >
                      {jobSummaries.map((item, index) => (
                        <Cell
                          key={item.jobTitle}
                          fill={index === 0 ? "var(--chart-1)" : "var(--accent)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Workforce mix"
          description={`Employees by job title · ${selectedCountry}`}
          className="min-h-[356px]"
        >
          {areJobAveragesError ? (
            <ChartEmptyState message={jobAveragesErrorMessage} />
          ) : areJobAveragesPending ? (
            <div className="flex min-h-[285px] items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading workforce mix...
            </div>
          ) : workforceTotal === 0 ? (
            <ChartEmptyState message="No workforce data to display yet." />
          ) : (
            <div className="flex flex-col items-center gap-4 px-5 pb-5 pt-4 sm:flex-row sm:items-center sm:justify-center xl:flex-col 2xl:flex-row">
              <div className="relative h-[200px] w-full max-w-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobSummaries}
                      dataKey="employeeCount"
                      nameKey="jobTitle"
                      innerRadius="68%"
                      outerRadius="88%"
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                    >
                      {jobSummaries.map((item, index) => (
                        <Cell
                          key={item.jobTitle}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        color: "var(--popover-foreground)",
                        fontSize: 12,
                      }}
                      formatter={(value, _name, item) => [
                        Number(value).toLocaleString(),
                        item.payload.jobTitle,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-[28px] font-semibold tabular-nums">
                    {workforceTotal.toLocaleString()}
                  </span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    employees
                  </span>
                </div>
              </div>

              <div className="grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-1 xl:grid-cols-1 2xl:max-w-[190px]">
                {jobSummaries.map((item, index) => {
                  const percentage =
                    workforceTotal > 0
                      ? Math.round((item.employeeCount / workforceTotal) * 100)
                      : 0

                  return (
                    <div
                      key={item.jobTitle}
                      className="flex min-w-0 items-center gap-3 text-xs"
                    >
                      <span
                        className="size-2 shrink-0 rounded-[2px]"
                        style={{
                          background:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {item.jobTitle}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                          {item.employeeCount.toLocaleString()} · {percentage}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-2 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-[17px] font-semibold">
              Compensation by role
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedCountry} · {jobSummaries.length} job titles
            </p>
          </div>
          <Link
            to="/employees"
            className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View employees <span aria-hidden="true">→</span>
          </Link>
        </div>

        {areJobAveragesError ? (
          <div role="alert" className="px-5 py-10 text-center">
            <p className="text-sm font-semibold">Couldn't load job-title averages</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {jobAveragesErrorMessage}
            </p>
            <button
              type="button"
              onClick={() => void refetchJobAverages()}
              className="mt-4 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Try again
            </button>
          </div>
        ) : areJobAveragesPending ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading role details...
          </div>
        ) : jobSummaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead className="bg-muted/70 text-[10px] font-semibold tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-semibold">JOB TITLE</th>
                  <th className="px-6 py-3 text-right font-semibold">EMPLOYEES</th>
                  <th className="px-6 py-3 text-right font-semibold">
                    AVERAGE ANNUAL SALARY
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobSummaries.map((summary, index) => (
                  <tr
                    key={summary.jobTitle}
                    className="border-t border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-[9px] font-medium">
                      <span className="flex items-center gap-3">
                        <span
                          className="size-[7px] rounded-[2px]"
                          style={{
                            background:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        {summary.jobTitle}
                      </span>
                    </td>
                    <td className="px-6 py-[9px] text-right tabular-nums">
                      {summary.employeeCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-[9px] text-right font-medium tabular-nums">
                      {money(summary.averageSalary)} {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="font-medium">No employee data available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no active employees for {selectedCountry} yet.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default OverviewPage
