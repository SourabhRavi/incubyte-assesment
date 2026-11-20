import { performance } from "node:perf_hooks";

type Sample = {
  name: string;
  durations: number[];
};

const apiBaseUrl = (
  process.env.BENCHMARK_API_URL ?? "http://localhost:3000/api/v1"
).replace(/\/$/, "");
const iterations = Number(process.env.BENCHMARK_ITERATIONS ?? 30);
const warmup = Number(process.env.BENCHMARK_WARMUP ?? 5);

if (!Number.isInteger(iterations) || iterations < 1) {
  throw new Error("BENCHMARK_ITERATIONS must be a positive integer.");
}

if (!Number.isInteger(warmup) || warmup < 0) {
  throw new Error("BENCHMARK_WARMUP must be a non-negative integer.");
}

async function request(path: string): Promise<unknown> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GET ${path} failed with HTTP ${response.status}: ${body.slice(0, 300)}`,
    );
  }

  return response.json();
}

function percentile(sorted: number[], fraction: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.ceil(fraction * sorted.length) - 1,
  );
  return sorted[index];
}

function summarize(sample: Sample) {
  const sorted = [...sample.durations].sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);

  return {
    scenario: sample.name,
    samples: sorted.length,
    meanMs: Number((total / sorted.length).toFixed(2)),
    p50Ms: Number(percentile(sorted, 0.5).toFixed(2)),
    p95Ms: Number(percentile(sorted, 0.95).toFixed(2)),
    minMs: Number(sorted[0].toFixed(2)),
    maxMs: Number(sorted[sorted.length - 1].toFixed(2)),
  };
}

async function measure(
  name: string,
  operation: () => Promise<unknown>,
): Promise<Sample> {
  for (let index = 0; index < warmup; index++) {
    await operation();
  }

  const durations: number[] = [];

  for (let index = 0; index < iterations; index++) {
    const startedAt = performance.now();
    await operation();
    durations.push(performance.now() - startedAt);
  }

  return { name, durations };
}

async function main() {
  const listing = (await request("/employees?page=1&limit=1")) as {
    pagination?: { total?: number };
  };
  const activeEmployeeCount = Number(listing.pagination?.total ?? 0);

  if (activeEmployeeCount < 10_000) {
    throw new Error(
      `Benchmark requires at least 10,000 active employees; API reported ${activeEmployeeCount}. Seed the benchmark database first.`,
    );
  }

  const scenarios: Array<{
    name: string;
    operation: () => Promise<unknown>;
  }> = [
    {
      name: "employee-list-page-25",
      operation: () => request("/employees?page=1&limit=25"),
    },
    {
      name: "employee-name-substring-search",
      operation: () => request("/employees?page=1&limit=25&search=a"),
    },
    {
      name: "employee-email-substring-search",
      operation: () =>
        request("/employees?page=1&limit=25&search=example.com"),
    },
    {
      name: "employee-country-job-title-filter",
      operation: () =>
        request(
          "/employees?page=1&limit=25&country=India&jobTitle=Software%20Engineer",
        ),
    },
    {
      name: "country-salary-summary",
      operation: () =>
        request("/analytics/salary-summary?country=India"),
    },
    {
      name: "country-job-title-averages",
      operation: () =>
        request("/analytics/job-title-average?country=India"),
    },
    {
      name: "dashboard-analytics-pair",
      operation: () =>
        Promise.all([
          request("/analytics/salary-summary?country=India"),
          request("/analytics/job-title-average?country=India"),
        ]),
    },
  ];

  const samples: Sample[] = [];

  for (const scenario of scenarios) {
    samples.push(await measure(scenario.name, scenario.operation));
  }

  console.log(
    JSON.stringify(
      {
        measuredAt: new Date().toISOString(),
        apiBaseUrl,
        activeEmployeeCount,
        iterations,
        warmup,
        results: samples.map(summarize),
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error("Performance benchmark failed:", error);
  process.exitCode = 1;
});
