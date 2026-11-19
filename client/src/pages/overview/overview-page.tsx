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
  <section className="overview-metric-card relative min-w-0 overflow-hidden">
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="flex shrink-0 items-center justify-center"
          style={{
            color: accent,
            background: `color-mix(in srgb,${accent} 11%,white)`,
          }}
        >
          <Icon />
        </span>
        <p>{title}</p>
      </div>
      <span className="text-muted-foreground" aria-hidden="true">
        ···
      </span>
    </div>
    <div className="flex min-h-7 items-center">
      {isLoading ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <p className="tabular-nums">{value}</p>
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
  <section
    className={`overview-chart-card min-w-0 overflow-hidden ${className}`}
  >
    <div className="flex items-start justify-between gap-3 border-b">
      <div className="min-w-0">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
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
    <div className="peopleops-overview space-y-4">
      <div className="overview-heading flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.15em] text-primary">
            ACME / People operations
          </div>
          <h1 className="font-heading font-semibold">Compensation overview</h1>
          <p>
            A clear view of workforce size and salary patterns across your
            markets.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-col justify-end gap-1">
            <label htmlFor="overview-country">Market detail</label>
            <NativeSelect
              id="overview-country"
              value={selectedCountry}
              onChange={(event) =>
                setSelectedCountry(event.target.value as Country)
              }
              className="w-full min-w-40 sm:w-44"
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
            className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border bg-card px-3 text-[11px] font-medium hover:bg-muted disabled:opacity-50"
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
          value={largestMarket?.country ?? "—"}
          detail={
            largestMarket
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

      <div className="overview-dashboard-grid grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,.88fr)]">
        <ChartCard
          title="Workforce by market"
          description="Active employee distribution. Salary averages remain in each local currency."
          action={
            <span className="shrink-0 rounded-md bg-primary/8 px-2 py-1 text-[9px] font-semibold text-primary">
              {allMarketsLoaded ? totalEmployees.toLocaleString() : "—"} people
            </span>
          }
        >
          {marketSummaries.length === 0 ? (
            <ChartEmptyState
              message={
                hasMarketError
                  ? "Country data is temporarily unavailable."
                  : "Loading workforce distribution..."
              }
            />
          ) : (
            <div className="space-y-4 px-4 py-4">
              {COUNTRIES.map((country, index) => {
                const summary = allSalarySummaries[index]?.data
                if (!summary) {
                  return (
                    <div
                      key={country}
                      className="grid grid-cols-[minmax(90px,1fr)_minmax(0,2fr)_auto] items-center gap-3"
                    >
                      <span className="truncate text-[10px] text-muted-foreground">
                        {country}
                      </span>
                      <div className="h-2 overflow-hidden rounded-full bg-muted" />
                      <span className="text-[10px] text-muted-foreground">
                        —
                      </span>
                    </div>
                  )
                }
                const share =
                  totalEmployees > 0
                    ? (summary.employeeCount / totalEmployees) * 100
                    : 0
                const barWidth =
                  (summary.employeeCount / maxMarketEmployees) * 100

                return (
                  <div
                    key={country}
                    className="grid grid-cols-[minmax(90px,1fr)_minmax(0,2fr)_auto] items-center gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold">
                        {country}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {share.toFixed(1)}% of workforce
                      </p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{
                          width: `${barWidth}%`,
                          background: CHART_COLORS[index],
                        }}
                      />
                    </div>
                    <div className="min-w-[78px] text-right">
                      <p className="text-[11px] font-semibold tabular-nums">
                        {summary.employeeCount.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {formatMoney(summary.averageSalary, summary.currency)}{" "}
                        avg.
                      </p>
                    </div>
                  </div>
                )
              })}
              <p className="border-t pt-3 text-[9px] leading-relaxed text-muted-foreground">
                Average salary is shown in the local currency for each market.
                Cross-currency totals are intentionally not combined.
              </p>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={`Salary profile · ${selectedCountry}`}
          description={`Annual compensation range in ${currency}`}
        >
          {isSummaryPending ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading salary profile...
            </div>
          ) : isSummaryError ? (
            <ChartEmptyState message="Salary profile is unavailable." />
          ) : (
            <div className="space-y-5 px-4 py-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    Minimum annual salary
                  </span>
                  <strong className="text-[12px] font-semibold tabular-nums">
                    {money(salarySummary?.minSalary)}
                  </strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
                  <div
                    className="h-full rounded-full bg-[#73A98A]"
                    style={{ width: `${minimumRatio}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    Average annual salary
                  </span>
                  <strong className="text-[12px] font-semibold tabular-nums">
                    {money(salarySummary?.averageSalary)}
                  </strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
                  <div
                    className="h-full rounded-full bg-[#315DEB]"
                    style={{ width: `${averageRatio}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    Maximum annual salary
                  </span>
                  <strong className="text-[12px] font-semibold tabular-nums">
                    {money(salarySummary?.maxSalary)}
                  </strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF1F5]">
                  <div className="h-full w-full rounded-full bg-[#D69A5B]" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-[9px] text-muted-foreground">
                <span>
                  {salarySummary?.employeeCount.toLocaleString() ?? 0} active
                  employees
                </span>
                <span>{currency} · annual</span>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="overview-dashboard-grid grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,.88fr)]">
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
            <div className="space-y-3 px-4 pb-4 pt-5">
              {jobSummaries.map((item, index) => {
                const value = Number(item.averageSalary)
                const ratio = Math.max(
                  0,
                  Math.min(100, (value / maxRoleSalary) * 100),
                )
                return (
                  <div
                    key={item.jobTitle}
                    className="grid grid-cols-[minmax(100px,126px)_minmax(0,1fr)] items-center gap-3"
                  >
                    <span
                      className="truncate text-right text-[10px] text-muted-foreground"
                      title={item.jobTitle}
                    >
                      {item.jobTitle}
                    </span>
                    <div className="min-w-0">
                      <div className="h-3 w-full overflow-hidden rounded-[3px] bg-[#F0F3F7]">
                        <div
                          className="h-full rounded-[3px] transition-[width] duration-500"
                          style={{
                            width: `${ratio}%`,
                            background: CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[9px] text-muted-foreground">
                        <span>{item.employeeCount.toLocaleString()} people</span>
                        <span className="font-semibold tabular-nums">
                          {money(value)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="ml-[138px] flex justify-between border-t pt-2 text-[9px] text-muted-foreground">
                <span>{formatCompactMoney(0, currency)}</span>
                <span>{formatCompactMoney(maxRoleSalary / 2, currency)}</span>
                <span>{formatCompactMoney(maxRoleSalary, currency)}</span>
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
                  <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
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

      <section className="overview-data-table overflow-hidden">
        <div className="flex flex-col gap-2 border-b sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading">Role-level compensation details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Employee counts and average annual salary by job title.
            </p>
          </div>
          <span className="w-fit rounded-md bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary">
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
            <table className="w-full min-w-100 text-left text-xs">
              <thead>
                <tr>
                  <th className="px-4 py-2.5 font-medium">Job title</th>
                  <th className="px-4 py-2.5 text-right font-medium">
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
                    <td className="px-4 py-3 font-medium">
                      {summary.jobTitle}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {summary.employeeCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
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
        <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-[10px] text-muted-foreground">
          Salary values are annual and shown only in {currency}. Deleted
          employees are excluded.
        </div>
      </section>
    </div>
  )
}

export default OverviewPage
