# ACME People — Performance Measurement

## Objective

Measure the employee and compensation API against the assessment's 10,000-employee workload. This document intentionally separates a reproducible method from measured results. No latency numbers are claimed until the benchmark is run against the stated environment.

## Workload

The benchmark runner is `server/src/prisma/benchmark.ts`. It sends read-only HTTP requests to a running API and records per-request latency using Node's high-resolution performance timer.

It first checks the active employee total through the paginated employee endpoint and refuses to report a 10k benchmark when fewer than 10,000 active employees are present.

Scenarios:
1. Employee list, first page of 25.
2. Name substring search.
3. Email substring search.
4. Country + job-title filter.
5. Country salary summary.
6. Country job-title averages.
7. Combined dashboard request, issuing the two selected-country analytics requests concurrently.

Each scenario includes warm-up requests. The runner reports sample count, arithmetic mean, median (p50), p95 and minimum/maximum latency in milliseconds.

## Reproduce

Prerequisites:
- Node.js version supported by the repository.
- PostgreSQL initialized with the current Prisma contract.
- Exactly or at least 10,000 active seeded employees.
- Backend API running against that database.

From the repository root:

```bash
npm --prefix server install
cd server
cp .env.example .env
# Set DATABASE_URL to the benchmark database.
npm run contract:emit
npx prisma db init
npm run seed
npm run dev
```

In another terminal:

```bash
cd server
BENCHMARK_API_URL=http://localhost:3000/api/v1 npm run benchmark
```

Optional controls:
- `BENCHMARK_ITERATIONS`: measured requests per scenario (default 30).
- `BENCHMARK_WARMUP`: warm-up requests per scenario (default 5).
- `BENCHMARK_API_URL`: API base URL (default `http://localhost:3000/api/v1`).

The benchmark is read-only. It does not create, update or delete employees. Use a local or dedicated benchmark environment, not production.

## Environment record

Complete this section with the actual environment used for a run.

| Field | Value |
|---|---|
| Run date | Pending |
| Commit SHA | Pending |
| Node.js | Pending |
| PostgreSQL version / hosting | Pending |
| CPU / memory | Pending |
| Dataset | 10,000+ active employees required |
| Iterations / warm-up | Runner defaults: 30 / 5 |
| API location | Pending |

## Results

| Scenario | Mean (ms) | p50 (ms) | p95 (ms) | Min / max (ms) |
|---|---:|---:|---:|---:|
| Employee list (25) | Not measured | Not measured | Not measured | Not measured |
| Name substring search | Not measured | Not measured | Not measured | Not measured |
| Email substring search | Not measured | Not measured | Not measured | Not measured |
| Country + job title filter | Not measured | Not measured | Not measured | Not measured |
| Country salary summary | Not measured | Not measured | Not measured | Not measured |
| Job-title averages | Not measured | Not measured | Not measured | Not measured |
| Dashboard analytics pair | Not measured | Not measured | Not measured | Not measured |

Paste the runner's JSON output into the report or attach it as a dated result file. Do not compare runs from different machines or database tiers without noting the difference.

## Interpretation and follow-up

- The list endpoint should return only the requested page, not all employees.
- Country and country/job-title indexes exist in the current database contract and should be reviewed using `EXPLAIN (ANALYZE, BUFFERS)`.
- Search uses case-insensitive substring matching with a leading wildcard (`ILIKE '%term%'`). Standard B-tree indexes generally do not accelerate this predicate. Consider `pg_trgm` only if measured search latency and query plans justify the added index and extension.
- A partial index on active employees may help selected access patterns, but should be considered only after inspecting actual query plans.
- Record cold-start and steady-state behavior separately if the deployment environment has serverless or connection-pooling characteristics.

## Limitations

This microbenchmark measures API response time from the machine running the script. It includes network, API, ORM and database time, so it is not a pure SQL benchmark. It is sequential except for the dashboard pair. It does not simulate concurrent HR users, browser rendering or production traffic distribution. A separate load test is required before making concurrency or production-capacity claims.
