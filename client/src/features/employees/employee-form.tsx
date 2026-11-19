import { useState } from "react"

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

    if (!values.jobTitle) nextErrors.jobTitle = "Select a job title."
    if (!values.country) nextErrors.country = "Select a country."

    const salary = Number(values.salary)
    if (!values.salary.trim()) {
      nextErrors.salary = "Salary is required."
    } else if (!Number.isFinite(salary) || salary <= 0) {
      nextErrors.salary = "Enter a salary greater than zero."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || !validate()) return
    if (!values.jobTitle || !values.country) return

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
    "h-10 w-full rounded-lg border border-input bg-card px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"

  const labelClassName = "text-[12px] font-medium text-foreground"

  const RequiredMark = () => (
    <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <div className="space-y-5 px-6 py-5">
        <div className="space-y-2">
          <label htmlFor="employee-full-name" className={labelClassName}>
            Full name<RequiredMark />
          </label>
          <input
            id="employee-full-name"
            autoComplete="name"
            maxLength={120}
            required
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "employee-full-name-error" : undefined}
            placeholder="Enter full name"
            className={inputClassName}
          />
          {errors.fullName && (
            <p id="employee-full-name-error" className="text-xs text-destructive">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="employee-email" className={labelClassName}>
            Email<RequiredMark />
          </label>
          <input
            id="employee-email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "employee-email-error" : undefined}
            placeholder="name@company.com"
            className={inputClassName}
          />
          {errors.email && (
            <p id="employee-email-error" className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="employee-job-title" className={labelClassName}>
            Job title<RequiredMark />
          </label>
          <select
            id="employee-job-title"
            required
            value={values.jobTitle}
            onChange={(event) =>
              updateField("jobTitle", event.target.value as JobTitle | "")
            }
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.jobTitle)}
            aria-describedby={errors.jobTitle ? "employee-job-title-error" : undefined}
            className={inputClassName}
          >
            <option value="">Select a job title</option>
            {JOB_TITLES.map((jobTitle) => (
              <option key={jobTitle} value={jobTitle}>
                {jobTitle}
              </option>
            ))}
          </select>
          {errors.jobTitle && (
            <p id="employee-job-title-error" className="text-xs text-destructive">
              {errors.jobTitle}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="employee-country" className={labelClassName}>
            Country<RequiredMark />
          </label>
          <select
            id="employee-country"
            required
            value={values.country}
            onChange={(event) =>
              updateField("country", event.target.value as Country | "")
            }
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={errors.country ? "employee-country-error" : undefined}
            className={inputClassName}
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p id="employee-country-error" className="text-xs text-destructive">
              {errors.country}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="employee-salary" className={labelClassName}>
            Annual salary<RequiredMark />
          </label>
          <input
            id="employee-salary"
            type="number"
            min="0.01"
            step="any"
            inputMode="decimal"
            required
            value={values.salary}
            onChange={(event) => updateField("salary", event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.salary)}
            aria-describedby={errors.salary ? "employee-salary-error" : undefined}
            placeholder="Enter annual salary"
            className={inputClassName}
          />
          {errors.salary && (
            <p id="employee-salary-error" className="text-xs text-destructive">
              {errors.salary}
            </p>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs text-muted-foreground">
            Currency: <span className="font-semibold text-foreground">{currency ?? "Set by country"}</span>
            {" "}· Set automatically by country.
          </p>
          <p className="text-[11px] text-muted-foreground">
            All fields are required. Salary is an annual amount.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border bg-background px-6 py-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 min-w-[150px] rounded-lg border border-border bg-card px-4 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 min-w-[150px] rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save employee"}
        </button>
      </div>
    </form>
  )
}

export default EmployeeForm
