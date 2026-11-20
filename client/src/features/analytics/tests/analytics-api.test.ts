import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { analyticsApi } from "../analytics-api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("analyticsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests country salary aggregates using the selected country", async () => {
    const summary = {
      country: "India",
      currency: "INR",
      employeeCount: 120,
      minSalary: "600000",
      maxSalary: "2900000",
      averageSalary: "1700000",
    };
    vi.mocked(api.get).mockResolvedValue({
      data: { data: summary },
    } as never);

    await expect(analyticsApi.getSalarySummary("India")).resolves.toEqual(
      summary,
    );
    expect(api.get).toHaveBeenCalledWith("/analytics/salary-summary", {
      params: { country: "India" },
    });
  });

  it("requests job-title averages for the selected country", async () => {
    const averages = {
      country: "Canada",
      currency: "CAD",
      data: [
        {
          jobTitle: "Software Engineer",
          employeeCount: 12,
          averageSalary: "105000",
        },
      ],
    };
    vi.mocked(api.get).mockResolvedValue({
      data: { data: averages },
    } as never);

    await expect(analyticsApi.getJobTitleAverages("Canada")).resolves.toEqual(
      averages,
    );
    expect(api.get).toHaveBeenCalledWith("/analytics/job-title-average", {
      params: { country: "Canada" },
    });
  });

  it("preserves API failures for the dashboard error state", async () => {
    const failure = new Error("Analytics service unavailable");
    vi.mocked(api.get).mockRejectedValue(failure);

    await expect(analyticsApi.getSalarySummary("India")).rejects.toBe(failure);
  });
});
