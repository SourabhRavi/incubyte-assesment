import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteEmployee } from "@/features/employees/employee-mutations"
import type { Employee } from "@/features/employees/employee-types"
import { toast } from "sonner"

type DeleteEmployeeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
}

const DeleteEmployeeDialog = ({
  open,
  onOpenChange,
  employee,
}: DeleteEmployeeDialogProps) => {
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deleteMutation = useDeleteEmployee()

  const handleOpenChange = (nextOpen: boolean) => {
    if (deleteMutation.isPending) return
    if (nextOpen) setDeleteError(null)
    onOpenChange(nextOpen)
  }

  const handleDelete = async () => {
    if (!employee || deleteMutation.isPending) return
    setDeleteError(null)

    try {
      await deleteMutation.mutateAsync(employee.id)
      toast.success("Employee removed from active directory", {
        description: `${employee.fullName} is no longer included in active employee lists or salary analytics.`,
      })
      onOpenChange(false)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the employee. Please try again."
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-2xl sm:max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-[20px] font-semibold">
            Delete employee?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-6">
            This employee will be removed from the active directory and
            excluded from active salary analytics. The employee record is
            retained in the database.
            {employee && (
              <span className="mt-4 block rounded-lg border border-border bg-background px-3 py-3 font-medium text-foreground">
                {employee.fullName}
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {employee.email}
                </span>
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <p role="alert" className="text-sm text-destructive">
            {deleteError}
          </p>
        )}

        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
            disabled={!employee || deleteMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Removing..." : "Delete employee"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteEmployeeDialog
