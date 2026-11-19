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

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const formatMoney = (
  value: number | string | null | undefined,
  currency: string
) => {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return "—"
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatCompactMoney = (value: number, currency: string) =>
  new Intl.NumberFormat("en", {
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
  accent: string
}

const MetricCard = ({
  title,
  value,
  detail,
  icon: Icon,
  isLoading = false,
  accent,
}: MetricCardProps) => (
  <section className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <div
      className="absolute inset-x-0 top-0 h-1 opacity-80"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10">
        <Icon className="size-4.5" />
      </span>
    </div>

    <div className="mt-5 flex min-h-9 items-center">
      {isLoading ? (
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <p className="font-heading text-[1.7rem] font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      )}
    </div>
    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
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
  <section className={`min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm ${className}`}>
    <div className="border-b px-5 py-4">
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </section>
)

const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex min-h-64 items-center justify-center px-6 text-center text-sm text-muted-foreground">
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

  return (
    <div className="peopleops-overview space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Workforce intelligence
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            People overview
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A clear view of your workforce and compensation.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex flex-col justify-end gap-1.5">
            <label
              htmlFor="overview-country"
              className="text-xs font-medium text-muted-foreground"
            >
              Reporting country
            </label>
            <NativeSelect
              id="overview-country"
              value={selectedCountry}
              onChange={(event) => {
                setSelectedCountry(event.target.value as Country)
              }}
              className="w-full min-w-48 sm:w-48"
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
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="font-medium">Couldn't load salary statistics</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {summaryErrorMessage}
          </p>
          <button
            type="button"
            onClick={() => void refetchSummary()}
            className="mt-3 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Retry
          </button>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Employees"
          value={String(salarySummary?.employeeCount.toLocaleString() ?? 0)}
          detail={`Active employees in ${selectedCountry}`}
          icon={Users}
          isLoading={isSummaryPending}
          accent="var(--chart-1)"
        />
        <MetricCard
          title="Minimum salary"
          value={money(salarySummary?.minSalary)}
          detail="Annual compensation"
          icon={ArrowDown}
          isLoading={isSummaryPending}
          accent="var(--chart-2)"
        />
        <MetricCard
          title="Average salary"
          value={money(salarySummary?.averageSalary)}
          detail="Annual compensation"
          icon={ChartNoAxesCombined}
          isLoading={isSummaryPending}
          accent="var(--chart-3)"
        />
        <MetricCard
          title="Maximum salary"
          value={money(salarySummary?.maxSalary)}
          detail="Annual compensation"
          icon={Wallet}
          isLoading={isSummaryPending}
          accent="var(--chart-4)"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <ChartCard
          title="Average salary by role"
          description={`Annual compensation in ${currency} · ${selectedCountry}`}
        >
          {areJobAveragesError ? (
            <ChartEmptyState message={jobAveragesErrorMessage} />
          ) : areJobAveragesPending ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading salary breakdown...
            </div>
          ) : jobSummaries.length === 0 ? (
            <ChartEmptyState message={`No active employee data for ${selectedCountry} yet.`} />
          ) : (
            <div className="px-3 pb-4 pt-5 sm:px-5">
              <div
                className="w-full"
                style={{ height: Math.max(280, jobSummaries.length * 38) }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobSummaries}
                    layout="vertical"
                    margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
                    barCategoryGap={10}
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
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      type="category"
                      dataKey="jobTitle"
                      width={138}
                      interval={0}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.55 }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        color: "var(--popover-foreground)",
                        boxShadow: "0 8px 30px rgb(0 0 0 / 0.08)",
                      }}
                      formatter={(value) => [
                        money(Number(value)),
                        "Average salary",
                      ]}
                    />
                    <Bar
                      dataKey="averageSalary"
                      name="Average salary"
                      fill="var(--chart-3)"
                      radius={[0, 7, 7, 0]}
                      maxBarSize={19}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Workforce mix"
          description={`Active employees by job title · ${selectedCountry}`}
        >
          {areJobAveragesError ? (
            <ChartEmptyState message={jobAveragesErrorMessage} />
          ) : areJobAveragesPending ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading workforce mix...
            </div>
          ) : workforceTotal === 0 ? (
            <ChartEmptyState message="No workforce data to display yet." />
          ) : (
            <div className="px-5 pb-5 pt-4">
              <div className="relative mx-auto h-56 max-w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobSummaries}
                      dataKey="employeeCount"
                      nameKey="jobTitle"
                      innerRadius="66%"
                      outerRadius="88%"
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={3}
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
                        borderRadius: 12,
                        color: "var(--popover-foreground)",
                        boxShadow: "0 8px 30px rgb(0 0 0 / 0.08)",
                      }}
                      formatter={(value, _name, item) => [
                        Number(value).toLocaleString(),
                        item.payload.jobTitle,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
                    {workforceTotal.toLocaleString()}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    employees
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {jobSummaries.map((item, index) => (
                  <div
                    key={item.jobTitle}
                    className="flex min-w-0 items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-sm"
                        style={{
                          background:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate text-muted-foreground">
                        {item.jobTitle}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {item.employeeCount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold">
              Role-level compensation details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Employee counts and average annual salary by job title.
            </p>
          </div>
          <span className="w-fit rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
            {selectedCountry} · {currency}
          </span>
        </div>

        {areJobAveragesError ? (
          <div role="alert" className="px-5 py-10 text-center">
            <p className="font-medium">Couldn't load job-title averages</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {jobAveragesErrorMessage}
            </p>
            <button
              type="button"
              onClick={() => void refetchJobAverages()}
              className="mt-4 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
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
            <table className="w-full min-w-120 text-left text-sm">
              <thead className="bg-muted/35 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Job title</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Employees
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    Average salary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobSummaries.map((summary) => (
                  <tr
                    key={summary.jobTitle}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      {summary.jobTitle}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">
                      {summary.employeeCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                      {money(summary.averageSalary)}
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

        <div className="flex items-center gap-2 border-t bg-muted/50 px-5 py-3 text-xs text-muted-foreground">
          Salary values are annual and shown only in {currency}. Deleted
          employees are excluded.
        </div>
      </section>
    </div>
  )
}

export default OverviewPage
