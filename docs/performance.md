# ACME People — Performance Measurement

## Objective

Measure the employee and compensation API against the assessment's 10,000-employee workload. This document records the benchmark method and the first measured local run. The results are API response-time measurements from the machine running the benchmark, not production latency or a concurrency/load test.

## Workload

The benchmark runner is `server/src/prisma/benchmark.ts`. It sends read-only HTTP requests to a running API and records per-request latency using Node's high-resolution performance timer.

The runner checks the active employee total through the paginated employee endpoint before benchmarking. The recorded run reported 10,000 active employees.

Scenarios:
1. Employee list, first page of 25.
2. Name substring search.
3. Email substring search.
4. Country + job-title filter.
5. Country salary summary.
6. Country job-title averages.
7. Combined dashboard request, issuing the two selected-country analytics requests concurrently.

Each scenario uses 5 warm-up requests followed by 30 measured requests. The runner reports sample count, arithmetic mean, median (p50), p95 and minimum/maximum latency in milliseconds.

## Reproduce

Prerequisites:
- Node.js version supported by the repository.
- PostgreSQL initialized with the current Prisma contract.
- At least 10,000 active seeded employees.
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

| Field | Value |
|---|---|
| Run date/time | 2026-11-20 08:56:16 UTC |
| Commit SHA | Not captured at execution time |
| Node.js | Not captured |
| PostgreSQL version / hosting | Not captured |
| CPU / memory | Not captured |
| Active employees | 10,000 |
| Iterations / warm-up | 30 / 5 per scenario |
| API location | Local API: `http://localhost:3000/api/v1` |

## Results

All values are milliseconds. Each scenario contains 30 measured samples after 5 warm-up requests.

| Scenario | Mean (ms) | p50 (ms) | p95 (ms) | Min (ms) | Max (ms) |
|---|---:|---:|---:|---:|---:|
| Employee list (25) | 97.66 | 97.63 | 98.96 | 95.22 | 99.24 |
| Name substring search | 99.74 | 98.69 | 103.05 | 96.27 | 119.30 |
| Email substring search | 108.06 | 107.60 | 118.47 | 101.93 | 120.17 |
| Country + job title filter | 104.08 | 103.43 | 107.47 | 99.66 | 112.17 |
| Country salary summary | 108.54 | 108.21 | 112.40 | 102.74 | 120.43 |
| Country job-title averages | 104.80 | 105.10 | 106.50 | 97.50 | 108.63 |
| Dashboard analytics pair | 97.88 | 97.69 | 102.23 | 95.69 | 103.30 |

### Initial observations

- All seven scenarios recorded a p95 below 120 ms in this local run.
- Employee list (25) had the lowest mean latency at 97.66 ms.
- Email substring search had the highest mean (108.06 ms) and p95 (118.47 ms).
- The two country-level analytics scenarios had mean latencies of 108.54 ms and 104.80 ms.
- These observations describe this single run only. They are not service-level objectives or guarantees.

Do not compare runs from different machines or database tiers without noting the difference.

## Interpretation and follow-up

- The list endpoint should return only the requested page, not all employees.
- Country and country/job-title indexes exist in the current database contract and should be reviewed using `EXPLAIN (ANALYZE, BUFFERS)`.
- Search uses case-insensitive substring matching with a leading wildcard (`ILIKE '%term%'`). Standard B-tree indexes generally do not accelerate this predicate. Consider `pg_trgm` only if measured search latency and query plans justify the added index and extension.
- A partial index on active employees may help selected access patterns, but should be considered only after inspecting actual query plans.
- Record cold-start and steady-state behavior separately if the deployment environment has serverless or connection-pooling characteristics.

## Limitations

This microbenchmark measures API response time from the machine running the script. It includes network, API, ORM and database time, so it is not a pure SQL benchmark. It is sequential except for the dashboard pair. It does not simulate concurrent HR users, browser rendering or production traffic distribution. A separate load test is required before making concurrency or production-capacity claims.

The recorded run used a local API URL. Its results must not be presented as production measurements. The Node.js version, database version/hosting, hardware details and exact source commit were not captured during the run.
