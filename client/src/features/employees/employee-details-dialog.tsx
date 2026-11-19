import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Fingerprint,
  Mail,
  MapPin,
  Wallet,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  COUNTRY_CURRENCIES,
  type Employee,
} from "@/features/employees/employee-types"

type EmployeeDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
}

const formatSalary = (employee: Employee) => {
  const currency = COUNTRY_CURRENCIES[employee.country]
  const amount = Number(employee.salary)

  if (!Number.isFinite(amount)) return `${employee.salary} ${currency}`

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return { date: "Not available", time: "" }
  }

  return {
    date: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date),
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(date),
  }
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

const DetailItem = ({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: typeof Mail
  label: string
  value: string
  className?: string
}) => (
  <div className={`flex min-w-0 gap-3 ${className}`}>
    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
    </div>
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium text-foreground">
        {value || "Not available"}
      </p>
    </div>
  </div>
)

const TimestampItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) => {
  const formatted = formatDate(value)

  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{formatted.date}</p>
        {formatted.time && (
          <p className="text-xs text-muted-foreground">{formatted.time} IST</p>
        )}
      </div>
    </div>
  )
}

const EmployeeDetailsDialog = ({
  open,
  onOpenChange,
  employee,
}: EmployeeDetailsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[min(90vh,760px)] gap-0 overflow-y-auto p-0 sm:max-w-xl">
      {employee && (
        <>
          <DialogHeader className="p-6 pb-5">
            <div className="flex items-start gap-4 pr-7">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                {getInitials(employee.fullName)}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <DialogTitle className="truncate text-lg">
                  {employee.fullName}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{employee.jobTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{employee.country}</span>
                </DialogDescription>
                <div className="pt-1">
                  <span className="inline-flex items-center rounded-full border border-emerald-600/20 bg-emerald-600/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Employee record
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          <div className="space-y-6 p-6">
            <section className="space-y-4" aria-labelledby="employee-overview-heading">
              <div>
                <h3 id="employee-overview-heading" className="text-sm font-semibold">
                  Employee information
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contact and role details
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <DetailItem icon={Mail} label="Work email" value={employee.email} />
                <DetailItem icon={BriefcaseBusiness} label="Job title" value={employee.jobTitle} />
                <DetailItem icon={MapPin} label="Country" value={employee.country} />
                <DetailItem icon={Fingerprint} label="Employee ID" value={employee.id} />
              </div>
            </section>

            <section className="space-y-4" aria-labelledby="employee-compensation-heading">
              <Separator />
              <div>
                <h3 id="employee-compensation-heading" className="text-sm font-semibold">
                  Compensation
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Current annual salary in the employee's local currency
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wallet className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Annual salary
                    </p>
                    <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">
                      {formatSalary(employee)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                  Currency: {COUNTRY_CURRENCIES[employee.country]} · Salary figures are not converted between countries.
                </p>
              </div>
            </section>

            <section className="space-y-4" aria-labelledby="employee-record-heading">
              <Separator />
              <div>
                <h3 id="employee-record-heading" className="text-sm font-semibold">
                  Record activity
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Audit timestamps for this employee record
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TimestampItem
                  icon={CalendarDays}
                  label="Record created"
                  value={employee.createdAt}
                />
                <TimestampItem
                  icon={Clock3}
                  label="Last record update"
                  value={employee.updatedAt}
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The last record update may reflect any employee detail change. It does not necessarily indicate a salary revision date.
              </p>
            </section>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
)

export default EmployeeDetailsDialog
