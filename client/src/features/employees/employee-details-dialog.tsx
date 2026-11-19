import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  COUNTRY_CURRENCIES,
  type Employee,
} from "@/features/employees/employee-types"

type EmployeeDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
  onEdit?: (employee: Employee) => void
}

const formatSalary = (employee: Employee) => {
  const currency = COUNTRY_CURRENCIES[employee.country]
  const amount = Number(employee.salary)

  if (!Number.isFinite(amount)) return `${employee.salary} ${currency}`

  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not available"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start gap-4 py-3">
    <p className="text-[12px] text-muted-foreground">{label}</p>
    <p className="break-words text-[13px] font-medium text-foreground">
      {value || "Not available"}
    </p>
  </div>
)

const EmployeeDetailsDialog = ({
  open,
  onOpenChange,
  employee,
  onEdit,
}: EmployeeDetailsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-[480px]">
      <DialogHeader className="px-6 pt-6 text-left">
        <DialogTitle className="font-heading text-[18px] font-semibold">
          Employee details
        </DialogTitle>
        <DialogDescription className="sr-only">
          View employee information and record details.
        </DialogDescription>
      </DialogHeader>

      {employee && (
        <>
          <div className="flex items-center gap-4 px-6 py-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-[16px] font-semibold text-primary">
              {getInitials(employee.fullName)}
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-heading text-[21px] font-semibold">
                {employee.fullName}
              </h3>
              <p className="mt-1 truncate text-[12px] text-muted-foreground">
                {employee.email}
              </p>
            </div>
          </div>

          <div className="px-6 pb-5">
            <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
              EMPLOYMENT
            </p>
            <DetailRow label="Job title" value={employee.jobTitle} />
            <DetailRow label="Country" value={employee.country} />
            <DetailRow label="Annual salary" value={`${formatSalary(employee)} ${COUNTRY_CURRENCIES[employee.country]}`} />
          </div>

          <div className="mx-6 border-t border-border" />

          <div className="px-6 pt-5 pb-6">
            <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
              RECORD DETAILS
            </p>
            <DetailRow label="Employee ID" value={employee.id} />
            <DetailRow label="Created" value={formatDate(employee.createdAt)} />
            <DetailRow label="Last updated" value={formatDate(employee.updatedAt)} />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border bg-background px-6 py-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-lg border border-border bg-card px-4 text-[13px] font-semibold hover:bg-muted"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(employee)}
              className="h-10 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Edit employee
            </button>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
)

export default EmployeeDetailsDialog
