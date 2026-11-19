import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import {
  Eye,
  FilterX,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"

import EmployeeDialog from "@/features/employees/employee-dialog"
import DeleteEmployeeDialog from "@/features/employees/delete-employee-dialog"
import EmployeeDetailsDialog from "@/features/employees/employee-details-dialog"
import { useEmployees } from "@/features/employees/employee-queries"

import {
  COUNTRIES,
  COUNTRY_CURRENCIES,
  JOB_TITLES,
} from "@/features/employees/employee-types"

import type {
  Country,
  Employee,
  EmployeeFilters,
  JobTitle,
} from "@/features/employees/employee-types"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Input } from "@/components/ui/input.tsx"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const COUNTRY_CODES: Record<string, string> = {
  India: "IN",
  "United States": "US",
  "United Kingdom": "GB",
  Germany: "DE",
  Canada: "CA",
}

const formatSalary = (salary: number | string, currency?: string) => {
  const amount = Number(salary)
  if (!Number.isFinite(amount)) return String(salary)

  const locale = currency === "INR" ? "en-IN" : "en-US"
  return new Intl.NumberFormat(locale, {
    style: currency ? "currency" : "decimal",
    ...(currency ? { currency } : {}),
    maximumFractionDigits: 0,
  }).format(amount)
}

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

type EmployeeActionsProps = {
  employee: Employee
  onView: (employee: Employee) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

const EmployeeActions = ({
  employee,
  onView,
  onEdit,
  onDelete,
}: EmployeeActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      type="button"
      title={`Actions for ${employee.fullName}`}
      aria-label={`Actions for ${employee.fullName}`}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <MoreVertical className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuItem onClick={() => onView(employee)}>
        <Eye className="mr-2 size-4" />
        View details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEdit(employee)}>
        <Pencil className="mr-2 size-4" />
        Edit employee
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => onDelete(employee)}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 size-4" />
        Delete employee
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

type EmployeeRowProps = EmployeeActionsProps

const EmployeeRow = ({
  employee,
  onView,
  onEdit,
  onDelete,
}: EmployeeRowProps) => (
  <tr className="border-t border-border transition-colors hover:bg-muted/25">
    <td className="px-5 py-2.5">
      <div className="flex min-w-[170px] items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary">
          {getInitials(employee.fullName)}
        </span>
        <span className="truncate text-[13px] font-medium">
          {employee.fullName}
        </span>
      </div>
    </td>
    <td className="px-5 py-2.5 text-[12px] text-muted-foreground">
      <span className="block max-w-[220px] truncate">{employee.email}</span>
    </td>
    <td className="px-5 py-2.5 text-[12px]">{employee.jobTitle}</td>
    <td className="px-5 py-2.5">
      <span className="flex items-center gap-3 text-[12px]">
        <span className="text-[11px] font-semibold tracking-wide text-primary">
          {COUNTRY_CODES[employee.country] ?? employee.country.slice(0, 2).toUpperCase()}
        </span>
        {employee.country}
      </span>
    </td>
    <td className="px-5 py-2.5 text-right text-[12px] font-medium tabular-nums">
      {formatSalary(employee.salary, COUNTRY_CURRENCIES[employee.country])}{" "}
      {COUNTRY_CURRENCIES[employee.country]}
    </td>
    <td className="px-4 py-2 text-right">
      <EmployeeActions
        employee={employee}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </td>
  </tr>
)

const MobileEmployeeCard = ({
  employee,
  onView,
  onEdit,
  onDelete,
}: EmployeeActionsProps) => (
  <article className="rounded-lg border border-border bg-card p-4">
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary">
        {getInitials(employee.fullName)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{employee.fullName}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {employee.email}
        </p>
      </div>
      <EmployeeActions
        employee={employee}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
    <div className="mt-4 flex items-center justify-between gap-3 text-[12px]">
      <span className="min-w-0 truncate text-muted-foreground">
        {employee.jobTitle} · {employee.country}
      </span>
      <span className="shrink-0 font-semibold tabular-nums">
        {formatSalary(employee.salary, COUNTRY_CURRENCIES[employee.country])}{" "}
        {COUNTRY_CURRENCIES[employee.country]}
      </span>
    </div>
  </article>
)

const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("search") ?? ""
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const value = searchInput.trim()
      if (value === search) return

      const nextParams = new URLSearchParams(searchParams)
      if (value) nextParams.set("search", value)
      else nextParams.delete("search")
      nextParams.delete("page")
      setSearchParams(nextParams, { replace: true })
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [searchInput, search, searchParams, setSearchParams])

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>()
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const parsedLimit = Number(searchParams.get("limit")) || 10
  const limit = PAGE_SIZE_OPTIONS.includes(parsedLimit) ? parsedLimit : 10
  const country = searchParams.get("country") || ""
  const jobTitle = searchParams.get("jobTitle") || ""

  const filters: EmployeeFilters = {
    page,
    limit,
    ...(country ? { country: country as Country } : {}),
    ...(jobTitle ? { jobTitle: jobTitle as JobTitle } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  }

  const { data, isPending, isError, error, isFetching, refetch } =
    useEmployees(filters)

  const updateParams = (
    updates: Record<string, string>,
    options?: { replace?: boolean }
  ) => {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, value)
      else nextParams.delete(key)
    })
    setSearchParams(nextParams, options)
  }

  const updateFilter = (key: "country" | "jobTitle", value: string) => {
    updateParams({ [key]: value, page: "" })
  }

  const openViewDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeDialogOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const openAddDialog = () => {
    setSelectedEmployee(undefined)
    setIsEmployeeDialogOpen(true)
  }

  const clearFilters = () => {
    setSearchInput("")
    updateParams(
      { country: "", jobTitle: "", search: "", page: "" },
      { replace: true }
    )
  }

  const pagination = data?.pagination
  const employees = data?.data ?? []
  const hasFilters = Boolean(country || jobTitle || search)
  const startItem = pagination && pagination.total > 0
    ? (pagination.page - 1) * pagination.limit + 1
    : 0
  const endItem = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0

  return (
    <main className="flex min-h-0 flex-col gap-6 p-5 sm:p-7 lg:px-10 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-[28px] leading-tight font-semibold tracking-tight">
            Employees
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your employee directory and salary information.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddDialog}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add employee
        </button>
      </div>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 xl:flex-row xl:items-center">
          <div className="relative w-full xl:max-w-[368px]">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Search employees"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="h-10 rounded-lg border-border pl-10 pr-9 text-[12px] shadow-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchInput("")
                  updateParams({ search: "", page: "" }, { replace: true })
                }}
                className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 xl:flex">
            <NativeSelect
              aria-label="Filter by country"
              value={country}
              onChange={(event) => updateFilter("country", event.target.value)}
              className="h-10 w-full rounded-lg border-border bg-card text-[12px] xl:w-[190px]"
            >
              <NativeSelectOption value="">All countries</NativeSelectOption>
              {COUNTRIES.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <NativeSelect
              aria-label="Filter by job title"
              value={jobTitle}
              onChange={(event) => updateFilter("jobTitle", event.target.value)}
              className="h-10 w-full rounded-lg border-border bg-card text-[12px] xl:w-[190px]"
            >
              <NativeSelectOption value="">All job titles</NativeSelectOption>
              {JOB_TITLES.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="flex items-center justify-between gap-3 xl:ml-auto xl:justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FilterX className="size-3.5" />
              Clear filters
            </button>
            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
              {pagination ? `${pagination.total.toLocaleString()} employees` : " "}
            </span>
          </div>
        </div>

        {isError && (
          <div
            role="alert"
            className="m-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          >
            <p className="text-sm font-semibold">Couldn't load employees</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        <div className="hidden min-h-0 flex-1 overflow-x-auto md:block">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-muted/70 text-[10px] font-semibold tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">EMPLOYEE</th>
                <th className="px-5 py-3 font-semibold">EMAIL</th>
                <th className="px-5 py-3 font-semibold">JOB TITLE</th>
                <th className="px-5 py-3 font-semibold">COUNTRY</th>
                <th className="px-5 py-3 text-right font-semibold">ANNUAL SALARY</th>
                <th className="w-14 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isPending &&
                Array.from({ length: 10 }, (_, index) => (
                  <tr key={index} className="border-t border-border">
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-7 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}

              {!isPending && !isError && employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                      <Search className="size-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold">
                      {hasFilters ? "No matching employees" : "No employees yet"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {hasFilters
                        ? "Try changing or clearing your filters."
                        : "Add an employee to start building your directory."}
                    </p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-3 text-xs font-semibold text-primary hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {!isPending &&
                !isError &&
                employees.map((employee) => (
                  <EmployeeRow
                    key={employee.id}
                    employee={employee}
                    onView={openViewDialog}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {isPending &&
            Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-[104px] animate-pulse rounded-lg border border-border bg-muted/60"
              />
            ))}

          {!isPending && !isError && employees.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold">
                {hasFilters ? "No matching employees" : "No employees yet"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasFilters
                  ? "Try changing or clearing your filters."
                  : "Add an employee to start building your directory."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-xs font-semibold text-primary"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!isPending &&
            !isError &&
            employees.map((employee) => (
              <MobileEmployeeCard
                key={employee.id}
                employee={employee}
                onView={openViewDialog}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {pagination
              ? `Showing ${startItem.toLocaleString()}–${endItem.toLocaleString()} of ${pagination.total.toLocaleString()}`
              : "Showing employees"}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <label htmlFor="page-size">Rows per page</label>
              <NativeSelect
                id="page-size"
                aria-label="Rows per page"
                value={String(limit)}
                onChange={(event) =>
                  updateParams({ limit: event.target.value, page: "" })
                }
                className="h-8 w-[68px] rounded-md border-border bg-card text-[11px]"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <NativeSelectOption key={size} value={String(size)}>
                    {size}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <p className="text-[11px] font-medium text-foreground">
              Page {pagination?.page ?? page} of {pagination?.totalPages ?? 0}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={!pagination?.hasPreviousPage || isFetching}
                onClick={() => updateParams({ page: String(page - 1) })}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={!pagination?.hasNextPage || isFetching}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <EmployeeDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        employee={selectedEmployee}
        onEdit={(employee) => {
          setIsViewDialogOpen(false)
          openEditDialog(employee)
        }}
      />

      <EmployeeDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        employee={selectedEmployee}
      />

      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={selectedEmployee}
      />
    </main>
  )
}

export default EmployeesPage
