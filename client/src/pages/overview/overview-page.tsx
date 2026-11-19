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
  useAllSalarySummaries,
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
  "#315DEB",
  "#73A98A",
  "#8B78CF",
  "#D69A5B",
  "#5A9EAD",
  "#7C91B8",
  "#BD7D9D",
  "#829B68",
  "#C17E59",
  "#6D9BCB",
]

const formatMoney = (
  value: number | string | null | undefined,
  currency: string,
) => {
  if (value === null || value === undefined || value === "") return "—"
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "—"

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
  <section className="relative overflow-hidden rounded-lg border border-[#E7EAF2] bg-white p-5 shadow-none transition-colors hover:border-[#d5d8e7]">
    <div
      className="absolute inset-x-0 top-0 h-0 opacity-0"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <span className="flex size-8 items-center justify-center rounded-md bg-[#EDEBFF] text-[#5146D8]">
        <Icon className="size-4.5" />
      </span>
    </div>
    <div className="flex min-h-7 items-center">
      {isLoading ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <p className="font-sans text-[28px] font-semibold leading-[1.35] tracking-normal text-[#25283A] tabular-nums">
          {value}
        </p>
      )}
    </div>
    <p>{detail}</p>
  </section>
)

const ChartCard = ({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) => (
  <section className={`min-w-0 overflow-hidden rounded-lg border border-[#E7EAF2] bg-white shadow-none ${className}`}>
    <div className="border-b border-[#E7EAF2] px-6 py-4">
      <h2 className="font-sans text-[16px] font-semibold text-[#25283A]">{title}</h2>
      <p className="mt-1 text-[12px] text-[#777F92]">{description}</p>
    </div>
    {children}
  </section>
)

const ChartEmptyState = ({ message }: { message: string }) => (
  <div className="flex min-h-40 items-center justify-center px-5 text-center text-xs text-muted-foreground">
    {message}
  </div>
)

const OverviewPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const allSalarySummaries = useAllSalarySummaries()
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

  const currency =
    salarySummary?.currency ??
    jobAverages?.currency ??
    COUNTRY_CURRENCIES[selectedCountry]
  const money = (value: number | string | null | undefined) =>
    formatMoney(value, currency)

  const marketSummaries = COUNTRIES.map((country, index) => ({
    country,
    summary: allSalarySummaries[index]?.data,
  })).filter((market) => market.summary !== undefined)
  const allMarketsLoaded = allSalarySummaries.every(
    (query) => query.data !== undefined,
  )
  const hasMarketError = allSalarySummaries.some((query) => query.isError)
  const totalEmployees = allMarketsLoaded
    ? marketSummaries.reduce(
        (total, market) => total + market.summary!.employeeCount,
        0,
      )
    : 0
  const largestMarket = marketSummaries.reduce<
    (typeof marketSummaries)[number] | undefined
  >(
    (largest, market) =>
      !largest ||
      market.summary!.employeeCount > largest.summary!.employeeCount
        ? market
        : largest,
    undefined,
  )

  const jobSummaries = jobAverages?.data ?? []
  const workforceTotal = jobSummaries.reduce(
    (total, item) => total + item.employeeCount,
    0,
  )
  const minimumSalary = Number(salarySummary?.minSalary ?? 0)
  const averageSalary = Number(salarySummary?.averageSalary ?? 0)
  const maximumSalary = Number(salarySummary?.maxSalary ?? 0)
  const salaryScale = maximumSalary > 0 ? maximumSalary : 1
  const minimumRatio = Math.min(
    100,
    Math.max(0, (minimumSalary / salaryScale) * 100),
  )
  const averageRatio = Math.min(
    100,
    Math.max(0, (averageSalary / salaryScale) * 100),
  )
  const maxRoleSalary = Math.max(
    1,
    ...jobSummaries.map((item) => Number(item.averageSalary)),
  )
  const maxMarketEmployees = Math.max(
    1,
    ...marketSummaries.map((market) => market.summary!.employeeCount),
  )
  const summaryErrorMessage =
    summaryError instanceof Error
      ? summaryError.message
      : "An unexpected error occurred."
  const jobAveragesErrorMessage =
    jobAveragesError instanceof Error
      ? jobAveragesError.message
      : "An unexpected error occurred."
  const isRefreshing =
    isSummaryFetching ||
    areJobAveragesFetching ||
    allSalarySummaries.some((query) => query.isFetching)

  const handleRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchJobAverages(),
      ...allSalarySummaries.map((query) => query.refetch()),
    ])
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Workforce intelligence
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            People overview
          </h1>
          <p className="mt-1.5 text-[14px] text-[#777F92]">
            A clear view of your workforce and compensation.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex flex-col justify-end gap-1.5">
            <label
              htmlFor="overview-country"
              className="sr-only"
            >
              Reporting country
            </label>
            <NativeSelect
              id="overview-country"
              value={selectedCountry}
              onChange={(event) =>
                setSelectedCountry(event.target.value as Country)
              }}
              className="h-11 w-full min-w-[204px] border-[#E7EAF2] bg-white text-[13px] sm:w-[204px]"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#E7EAF2] bg-white px-3 text-[12px] font-medium text-[#25283A] shadow-none transition-colors hover:bg-[#F7F8FC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {(isSummaryError || hasMarketError) && (
        <section
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs"
        >
          <p className="font-semibold">Some compensation data couldn't load</p>
          <p className="mt-1 text-muted-foreground">
            {isSummaryError
              ? summaryErrorMessage
              : "One or more country summaries are unavailable. Refresh to try again."}
          </p>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="mt-2 rounded-md border px-3 py-1.5"
          >
            Retry
          </button>
        </section>
      )}

      <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          title="Global workforce"
          value={
            allMarketsLoaded ? totalEmployees.toLocaleString() : "—"
          }
          detail="Active employees across all markets"
          icon={Users}
          isLoading={!allMarketsLoaded && !hasMarketError}
          accent="#315DEB"
        />
        <MetricCard
          title="Markets covered"
          value={String(COUNTRIES.length)}
          detail="Countries with salary reporting"
          icon={ChartNoAxesCombined}
          accent="#73A98A"
        />
        <MetricCard
          title="Largest market"
          value={allMarketsLoaded ? (largestMarket?.country ?? "—") : "—"}
          detail={
            allMarketsLoaded && largestMarket
              ? `${largestMarket.summary!.employeeCount.toLocaleString()} active employees`
              : "Market distribution"
          }
          icon={Wallet}
          isLoading={allSalarySummaries.some((query) => query.isPending)}
          accent="#8B78CF"
        />
        <MetricCard
          title={`Average salary · ${selectedCountry}`}
          value={money(salarySummary?.averageSalary)}
          detail={`Annual compensation · ${currency}`}
          icon={ArrowDown}
          isLoading={isSummaryPending}
          accent="#D69A5B"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,648fr)_minmax(360px,456fr)]">
        <ChartCard
          title="Average salary by role"
          description={`Annual compensation in ${currency} · ${selectedCountry}`}
        >
          {areJobAveragesError ? (
            <ChartEmptyState message={jobAveragesErrorMessage} />
          ) : areJobAveragesPending ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading salary breakdown...
            </div>
          ) : jobSummaries.length === 0 ? (
            <ChartEmptyState
              message={`No active employee data for ${selectedCountry} yet.`}
            />
          ) : (
            <div className="px-4 pb-3 pt-4 sm:px-5">
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
          description={`Employees by job title · ${selectedCountry}`}
        >
          {areJobAveragesError ? (
            <ChartEmptyState message={jobAveragesErrorMessage} />
          ) : areJobAveragesPending ? (
            <div className="flex min-h-56 items-center justify-center text-xs text-muted-foreground">
              Loading workforce mix...
            </div>
          ) : workforceTotal === 0 ? (
            <ChartEmptyState message="No workforce data to display yet." />
          ) : (
            <div className="px-4 pb-4 pt-3">
              <div className="relative mx-auto flex h-40 w-full max-w-52 items-center justify-center">
                <svg
                  viewBox="0 0 160 160"
                  className="h-40 w-40 -rotate-90"
                  role="img"
                  aria-label={`Workforce distribution across ${jobSummaries.length} job titles`}
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="57"
                    fill="none"
                    stroke="#EEF1F5"
                    strokeWidth="17"
                  />
                  {(() => {
                    const circumference = 2 * Math.PI * 57
                    let offset = 0
                    return jobSummaries.map((item, index) => {
                      const segment =
                        workforceTotal > 0
                          ? (item.employeeCount / workforceTotal) *
                            circumference
                          : 0
                      const element = (
                        <circle
                          key={item.jobTitle}
                          cx="80"
                          cy="80"
                          r="57"
                          fill="none"
                          stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          strokeWidth="17"
                          strokeDasharray={`${Math.max(0, segment - 2)} ${circumference}`}
                          strokeDashoffset={-offset}
                        />
                      )
                      offset += segment
                      return element
                    })
                  })()}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-sans text-[28px] font-semibold tracking-normal text-[#25283A] tabular-nums">
                    {workforceTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    employees
                  </span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                {jobSummaries.map((item, index) => (
                  <div
                    key={item.jobTitle}
                    className="flex min-w-0 items-center justify-between gap-2 text-[10px]"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          background: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate text-muted-foreground">
                        {item.jobTitle}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {item.employeeCount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#E7EAF2] bg-white shadow-none">
        <div className="flex flex-col gap-2 border-b border-[#E7EAF2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading">Role-level compensation details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              India · job-title compensation summary.
            </p>
          </div>
          <span className="w-fit rounded-md bg-[#EDEBFF] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#5146D8]">
            {selectedCountry} · {currency}
          </span>
        </div>
        {areJobAveragesError ? (
          <div
            role="alert"
            className="px-5 py-8 text-center text-xs"
          >
            <p className="font-medium">Couldn't load job-title averages</p>
            <p className="mt-1 text-muted-foreground">
              {jobAveragesErrorMessage}
            </p>
            <button
              type="button"
              onClick={() => void refetchJobAverages()}
              className="mt-3 rounded-md border px-3 py-1.5"
            >
              Try again
            </button>
          </div>
        ) : areJobAveragesPending ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading role details...
          </div>
        ) : jobSummaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead className="bg-[#F7F8FC] text-[10px] tracking-wide text-[#777F92]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Job title</th>
                  <th className="px-6 py-3 text-right font-semibold">
                    Employees
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
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
                    <td className="px-6 py-3.5 font-medium text-[#25283A]">
                      {summary.jobTitle}
                    </td>
                    <td className="px-6 py-3.5 text-right text-[#777F92] tabular-nums">
                      {summary.employeeCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-[#25283A] tabular-nums">
                      {money(summary.averageSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-xs">
            <p className="font-medium">No employee data available</p>
            <p className="mt-1 text-muted-foreground">
              There are no active employees for {selectedCountry} yet.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-[#E7EAF2] bg-[#F7F8FC] px-6 py-3 text-[11px] text-[#777F92]">
          Salary values are annual and shown only in {currency}. Deleted
          employees are excluded.
        </div>
      </section>
    </div>
  )
}

export default OverviewPage
