import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { employeeApi } from "../employee-api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const employee = {
  id: "employee-1",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  jobTitle: "Software Engineer",
  country: "India" as const,
  salary: 1_200_000,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("employeeApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends server-side pagination, search and filters without empty filters", async () => {
    const response = {
      data: {
        data: [employee],
        pagination: {
          page: 2,
          limit: 25,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      },
    };
    vi.mocked(api.get).mockResolvedValue(response as never);

    const result = await employeeApi.list({
      page: 2,
      limit: 25,
      search: "Ada",
      country: "India",
    });

    expect(api.get).toHaveBeenCalledWith("/employees", {
      params: {
        page: 2,
        limit: 25,
        search: "Ada",
        country: "India",
        jobTitle: undefined,
      },
    });
    expect(result).toEqual(response.data);
  });

  it("encodes employee identifiers when fetching a record", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: employee },
    } as never);

    await employeeApi.getById("employee/with space");

    expect(api.get).toHaveBeenCalledWith(
      "/employees/employee%2Fwith%20space",
    );
  });

  it("sends partial updates using PATCH and returns the updated employee", async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { data: employee },
    } as never);

    const result = await employeeApi.update("employee-1", {
      salary: 1_500_000,
    });

    expect(api.patch).toHaveBeenCalledWith("/employees/employee-1", {
      salary: 1_500_000,
    });
    expect(result).toEqual(employee);
  });

  it("uses DELETE for soft-delete requests", async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} } as never);

    await employeeApi.remove("employee-1");

    expect(api.delete).toHaveBeenCalledWith("/employees/employee-1");
  });

  it("propagates API errors so query and mutation handlers can report failures", async () => {
    const failure = new Error("API unavailable");
    vi.mocked(api.get).mockRejectedValue(failure);

    await expect(employeeApi.getById("employee-1")).rejects.toBe(failure);
  });
});
