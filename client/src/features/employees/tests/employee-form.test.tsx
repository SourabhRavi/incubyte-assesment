import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import EmployeeForm from "../employee-form"
import type { Employee } from "../employee-types"

const existingEmployee: Employee = {
  id: "employee-1",
  fullName: "Isai Kling",
  email: "isai.kling@example.com",
  jobTitle: "QA Engineer",
  country: "Canada",
  salary: 100,
  createdAt: "2026-11-19T10:00:00.000Z",
  updatedAt: "2026-11-20T04:41:00.000Z",
}

describe("EmployeeForm", () => {
  it("prevents submission when email and salary are invalid", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    render(
      <EmployeeForm
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText("Full name"), "Test Employee")
    await user.type(screen.getByLabelText("Work email"), "invalid-email")
    await user.selectOptions(
      screen.getByLabelText("Job title"),
      "Software Engineer"
    )
    await user.selectOptions(screen.getByLabelText("Country"), "India")
    await user.type(screen.getByLabelText("Annual salary"), "0")

    await user.click(screen.getByRole("button", { name: "Add employee" }))

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument()
    expect(
      screen.getByText("Enter a valid amount greater than zero with no more than 2 decimal places.")
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("accepts a valid whole-number salary and submits the parsed amount", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onCancel = vi.fn()

    render(
      <EmployeeForm
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText("Full name"), "  Ada Lovelace  ")
    await user.type(screen.getByLabelText("Work email"), "ada@example.com")
    await user.selectOptions(
      screen.getByLabelText("Job title"),
      "Software Engineer"
    )
    await user.selectOptions(screen.getByLabelText("Country"), "Canada")

    expect(screen.getByText("CAD")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Annual salary"), "123456")
    await user.click(screen.getByRole("button", { name: "Add employee" }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        jobTitle: "Software Engineer",
        country: "Canada",
        salary: 123456,
      })
    })
  })

  it("does not show a salary preview for an invalid amount", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <EmployeeForm
        employee={existingEmployee}
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    )

    const salaryInput = screen.getByLabelText("Annual salary")
    await user.clear(salaryInput)
    await user.type(salaryInput, "14.123")

    expect(screen.queryByText("Salary change preview")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(
      screen.getByText("Enter a valid amount greater than zero with no more than 2 decimal places.")
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("shows a correct percentage preview for a valid salary", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <EmployeeForm
        employee={existingEmployee}
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    )

    const salaryInput = screen.getByLabelText("Annual salary")
    await user.clear(salaryInput)
    await user.type(salaryInput, "125.50")

    expect(screen.getByText("Salary change preview")).toBeInTheDocument()
    expect(screen.getByText("+25.5% increase")).toBeInTheDocument()
  })
})
