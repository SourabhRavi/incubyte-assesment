# ACME People

Employee and salary management application built for the Incubyte engineering assessment.

## Links

- **Live Application:** [ACME People](https://incubyte-assesment-murex.vercel.app)
- **Demo Video:** [Watch the Loom walkthrough](https://www.loom.com/share/77c3471354f74b9ba38ba96c64132a64)

## Product artifacts

- [Product requirements](docs/requirements.md)
- [Dashboard design and interaction notes](docs/dashboard-design.md)
- [System architecture and trade-offs](docs/architecture.md)
- [AI development log](docs/ai-development-log.md)
- [Performance methodology and benchmark results](docs/performance.md)

## Features

- Employee CRUD: create, view, update, and soft-delete records.
- Search employees by name or email, filter by country and job title, and paginate results.
- View active workforce distribution across supported countries.
- Compare country-level employee counts and local-currency average salaries without combining unlike currencies.
- View minimum, maximum, and average salary by country.
- View average salary and employee count by job title within a country.
- Seed the database with 10,000 synthetic employees.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend:** Node.js, Express, TypeScript, Zod
- **Database:** PostgreSQL, Prisma ORM 8

## Prerequisites

- Node.js and npm
- PostgreSQL 15 or newer

## Setup and Run

### 1. Install dependencies

From the repository root:

```bash
npm --prefix server install
npm --prefix client install
```

### 2. Configure environment variables

Create `server/.env` using `server/.env.example` and configure your PostgreSQL connection:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/peopleops"
CLIENT_URL="http://localhost:5173"
PORT="3000"
```

Set `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Create the PostgreSQL database before initializing the schema.

### 3. Initialize the database and seed data

```bash
cd server
npm run contract:emit
npx prisma db init
npm run seed
npm run dev
```

The seed script creates 10,000 synthetic employee records in batches. It aborts if employee records already exist.

### 4. Start the frontend

In a separate terminal, from the repository root:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Automated quality checks

The [Quality checks workflow](.github/workflows/quality.yml) runs backend unit tests and type checking, plus frontend linting, tests and a production build for pull requests targeting `main` and pushes to `main`. PostgreSQL integration tests remain a separate command because they require an explicitly configured disposable database.

## Tests

Run unit tests and type checks:

```bash
npm --prefix server test
npm --prefix client test
npm --prefix server run typecheck
npm --prefix client run typecheck
npm --prefix client run build
```

Backend integration tests require a separate PostgreSQL test database. Configure `server/.env.test` with its `DATABASE_URL` and initialize the test schema before running:

```bash
npm --prefix server run test:integration
```

Use a dedicated disposable database for integration tests. The test file loads `server/.env.test` and requires its `DATABASE_URL` to point to that database. Do not use production data.

Generate coverage reports:

```bash
npm --prefix server run test:coverage
npm --prefix client run test:coverage
```

## 10,000-employee performance benchmark

With the API running against a database containing at least 10,000 active seeded employees, run:

```bash
cd server
BENCHMARK_API_URL=http://localhost:3000/api/v1 npm run benchmark
```

Optional settings: `BENCHMARK_ITERATIONS` (default 30) and `BENCHMARK_WARMUP` (default 5). The runner reports mean, p50 and p95 API latency for listing, substring search, combined filters, country salary aggregates, job-title averages and the dashboard analytics pair. It is read-only. Record the runtime, database tier and output in [performance.md](docs/performance.md); do not treat unmeasured values as results.

## Assumptions and Trade-offs

- Supported countries and job titles are fixed lists. Currency is derived from the employee's country.
- Salary analytics are calculated for one country at a time. Salaries across different currencies are not directly compared or added.
- Employee deletion uses soft deletion. Deleted employees are excluded from active listings and salary analytics.
- Salary statistics are calculated directly from database aggregations so results stay current without maintaining a separate summary table.
- Search uses case-insensitive substring matching on employee names and email addresses.
- The seed data is synthetic and intended for development and demonstration, not real HR use.

## Out of Scope

- **Authentication & RBAC:** Excluded to prioritize the assessment's core employee management and salary analytics workflows. This is not a production security recommendation.
- **Payroll, Attendance, Leave & Recruitment:** Excluded because these require separate business workflows beyond the stated requirements.
- **Historical salary trends and approvals:** Not implemented because the current data model does not capture salary history or approval events.
- **External salary benchmarking:** Excluded because no trusted benchmark source or methodology is supplied.
- **Advanced Search Optimization:** Deferred because the assessment dataset is limited to 10,000 employees; optimization should follow measured performance results.

The implementation prioritizes working end-to-end flows, meaningful automated tests, and maintainable code over additional features outside the assessment scope.
