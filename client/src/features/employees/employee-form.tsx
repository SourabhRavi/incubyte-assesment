import { useState } from "react"
import { BriefcaseBusiness, CalendarClock, ChevronDown, Mail, MapPin, UserRound, Wallet } from "lucide-react"

import {
  COUNTRIES,
  COUNTRY_CURRENCIES,
  JOB_TITLES,
} from "@/features/employees/employee-types"
import type {
  Country,
  CreateEmployeeInput,
  Employee,
  JobTitle,
  UpdateEmployeeInput,
} from "@/features/employees/employee-types"

type EmployeeFormProps = {
  employee?: Employee
  isSubmitting: boolean
  onSubmit: (input: CreateEmployeeInput | UpdateEmployeeInput) => Promise<void>
  onCancel: () => void
}

type FormValues = {
  fullName: string
  email: string
  jobTitle: JobTitle | ""
  country: Country | ""
  salary: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const getInitialValues = (employee?: Employee): FormValues => ({
  fullName: employee?.fullName ?? "",
  email: employee?.email ?? "",
  jobTitle: (employee?.jobTitle as JobTitle) ?? "",
  country: employee?.country ?? "",
  salary: employee ? String(employee.salary) : "",
})

const EmployeeForm = ({
  employee,
  isSubmitting,
  onSubmit,
  onCancel,
}: EmployeeFormProps) => {
  const [values, setValues] = useState<FormValues>(() =>
    getInitialValues(employee)
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const currency = values.country
    ? COUNTRY_CURRENCIES[values.country]
    : undefined
  const originalSalary = employee ? Number(employee.salary) : null
  const revisedSalary = Number(values.salary)
  const salaryDelta =
    originalSalary !== null &&
    originalSalary > 0 &&
    values.salary.trim() !== "" &&
    Number.isFinite(revisedSalary)
      ? ((revisedSalary - originalSalary) / originalSalary) * 100
      : null
  const formatMoney = (amount: number, currencyCode = currency ?? (employee ? COUNTRY_CURRENCIES[employee.country] : "USD")) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  const formatDate = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? "Not available"
      : new Intl.DateTimeFormat("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: true,
          timeZone: "Asia/Kolkata",
        }).format(date)
  }

  const updateField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Full name is required."
    } else if (values.fullName.trim().length > 120) {
      nextErrors.fullName = "Full name must be 120 characters or fewer."
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!values.jobTitle) {
      nextErrors.jobTitle = "Select a job title."
    }

    if (!values.country) {
      nextErrors.country = "Select a country."
    }

    const salary = Number(values.salary)

    if (!values.salary.trim()) {
      nextErrors.salary = "Salary is required."
    } else if (!Number.isFinite(salary) || salary <= 0) {
      nextErrors.salary = "Enter a salary greater than zero."
    } else if (!/^\\d+(?:\\.\\d{1,2})?$/.test(values.salary.trim())) {
      nextErrors.salary = "Enter a valid amount with no more than 2 decimal places."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting || !validate()) {
      return
    }

    if (!values.jobTitle || !values.country) {
      return
    }

    const input: CreateEmployeeInput = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      jobTitle: values.jobTitle,
      country: values.country,
      salary: Number(values.salary),
    }

    await onSubmit(input)
  }


  const inputClassName =
    "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-muted-foreground/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/15"

  const labelClassName = "text-[13px] font-medium text-foreground"

  const fieldShell = "space-y-2"
  const selectClassName = `${inputClassName} appearance-none pr-10`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {employee && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.045] p-3.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Editing employee record</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Update the employee's details. Changes are saved to the existing record.
            </p>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <UserRound className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Personal information</h3>
            <p className="text-xs text-muted-foreground">Employee identity and contact details</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`${fieldShell} sm:col-span-2`}>
            <label htmlFor="employee-full-name" className={labelClassName}>Full name <span className="text-destructive">*</span></label>
            <input
              id="employee-full-name"
              autoComplete="name"
              maxLength={120}
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "employee-full-name-error" : undefined}
              placeholder="e.g. Priya Sharma"
              className={inputClassName}
            />
            {errors.fullName && <p id="employee-full-name-error" className="text-xs text-destructive">{errors.fullName}</p>}
          </div>

          <div className={`${fieldShell} sm:col-span-2`}>
            <label htmlFor="employee-email" className={labelClassName}>Work email <span className="text-destructive">*</span></label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="employee-email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "employee-email-error" : undefined}
                placeholder="name@company.com"
                className={`${inputClassName} pl-10`}
              />
            </div>
            {errors.email && <p id="employee-email-error" className="text-xs text-destructive">{errors.email}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Role & location</h3>
            <p className="text-xs text-muted-foreground">Position and employing country</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldShell}>
            <label htmlFor="employee-job-title" className={labelClassName}>Job title <span className="text-destructive">*</span></label>
            <div className="relative">
              <select
                id="employee-job-title"
                value={values.jobTitle}
                onChange={(event) => updateField("jobTitle", event.target.value as JobTitle | "")}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.jobTitle)}
                aria-describedby={errors.jobTitle ? "employee-job-title-error" : undefined}
                className={selectClassName}
              >
                <option value="">Select job title</option>
                {JOB_TITLES.map((jobTitle) => <option key={jobTitle} value={jobTitle}>{jobTitle}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
            {errors.jobTitle && <p id="employee-job-title-error" className="text-xs text-destructive">{errors.jobTitle}</p>}
          </div>

          <div className={fieldShell}>
            <label htmlFor="employee-country" className={labelClassName}>Country <span className="text-destructive">*</span></label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <select
                id="employee-country"
                value={values.country}
                onChange={(event) => updateField("country", event.target.value as Country | "")}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? "employee-country-error" : undefined}
                className={`${selectClassName} pl-10`}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
            {errors.country && <p id="employee-country-error" className="text-xs text-destructive">{errors.country}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Wallet className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Compensation</h3>
            <p className="text-xs text-muted-foreground">Annual base salary in local currency</p>
          </div>
        </div>

        <div className={fieldShell}>
          <label htmlFor="employee-salary" className={labelClassName}>Annual salary <span className="text-destructive">*</span></label>
          <div className="flex rounded-lg shadow-sm">
            <div className="flex h-11 min-w-[68px] items-center justify-center rounded-l-lg border border-r-0 bg-muted/70 px-3 text-xs font-semibold text-muted-foreground">
              {currency ?? "CUR"}
            </div>
            <input
              id="employee-salary"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={values.salary}
              onChange={(event) => updateField("salary", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.salary)}
              aria-describedby={errors.salary ? "employee-salary-error" : "employee-salary-help"}
              placeholder="0.00"
              className={`${inputClassName} min-w-0 rounded-l-none`}
            />
          </div>
          {errors.salary && <p id="employee-salary-error" className="text-xs text-destructive">{errors.salary}</p>}
          <p id="employee-salary-help" className="text-xs text-muted-foreground">
            Currency is automatically set to {currency ?? "the selected country's currency"} based on the employee's country.
          </p>

          {employee && values.salary.trim() && salaryDelta !== null && Number.isFinite(salaryDelta) && (
            <div className="rounded-xl border bg-muted/25 p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Salary change preview</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatMoney(originalSalary!)}
                    <span className="mx-2 text-muted-foreground">→</span>
                    {formatMoney(revisedSalary)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {salaryDelta === 0 ? "No change to current salary" : `${formatMoney(Math.abs(revisedSalary - originalSalary!))} ${salaryDelta > 0 ? "increase" : "decrease"}`}
                  </p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${salaryDelta > 0 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : salaryDelta < 0 ? "bg-rose-500/10 text-rose-700 dark:text-rose-400" : "bg-muted text-muted-foreground"}`}>
                  {salaryDelta > 0 ? "↑" : salaryDelta < 0 ? "↓" : "•"}
                  {salaryDelta > 0 ? "+" : ""}{new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(salaryDelta)}%
                  {salaryDelta > 0 ? " increase" : salaryDelta < 0 ? " decrease" : " unchanged"}
                </span>
              </div>
            </div>
          )}

          {employee && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Last record update: <span className="font-medium text-foreground">{formatDate(employee.updatedAt)}</span></span>
            </div>
          )}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-1 flex flex-col-reverse gap-2 border-t bg-background/95 px-1 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 sm:min-w-24"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-36"
        >
          {isSubmitting ? "Saving..." : employee ? "Save changes" : "Add employee"}
        </button>
      </div>
    </form>
  )
}

export default EmployeeForm
