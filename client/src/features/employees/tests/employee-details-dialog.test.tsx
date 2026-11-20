import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EmployeeDetailsDialog from "../employee-details-dialog";
import type { Employee } from "../employee-types";

const employee: Employee = {
  id: "employee-1",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  jobTitle: "Software Engineer",
  country: "India",
  salary: 1_200_000,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("EmployeeDetailsDialog", () => {
  it("closes the details view and passes the selected employee to edit", () => {
    const onOpenChange = vi.fn();
    const onEdit = vi.fn();

    render(
      <EmployeeDetailsDialog
        open
        onOpenChange={onOpenChange}
        employee={employee}
        onEdit={onEdit}
      />,
    );

    expect(screen.getByText("ada@example.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit details" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onEdit).toHaveBeenCalledWith(employee);
  });

  it("does not render employee details when no employee is selected", () => {
    render(
      <EmployeeDetailsDialog
        open
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.queryByText("Employee information")).not.toBeInTheDocument();
  });
});
