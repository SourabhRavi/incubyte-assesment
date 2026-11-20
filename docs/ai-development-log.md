# AI Development Log

## Purpose

The assessment asks for intentional use of AI while maintaining correctness and engineering quality. AI assistance was used as a development accelerator for product framing, implementation exploration, debugging, UI iteration and review. The repository and running behavior remain the source of truth.

## Evidence and provenance

This log records development themes visible in the available project conversation and repository history. Some earlier raw prompts and complete model responses are not retained in the repository. Where exact wording is unavailable, entries below are described as prompt themes rather than presented as verbatim transcripts. The quoted examples are requests visible in the retained conversation context.

## 1. Product framing and scope

**Objective:** Translate the HR Manager problem into a focused employee and compensation product.

**AI-assisted activities:**
- Refining the one-page requirements and explicit exclusions.
- Reviewing whether proposed features answer the stated salary-management problem.
- Comparing dashboard information hierarchy and data boundaries.

**Human decisions recorded in the product requirements:**
- Keep employee CRUD, server-side search/filter/pagination and country-scoped salary analytics in scope.
- Exclude payroll, leave, attendance, recruitment, authentication/RBAC and cross-currency conversion.
- Do not fabricate salary trends or external benchmarks when the data model and source data do not support them.

**Verification:** Decisions are reflected in [requirements.md](./requirements.md) and [dashboard-design.md](./dashboard-design.md).

## 2. UI implementation and refinement

**Objective:** Improve the HR dashboard and employee workflows while preserving a restrained design system.

**Retained prompt examples:**
- “make light mode is too bright, fix it. update in a new branch from main”
- “connect avg salar and workforce mix charts interactivity”
- “make the employe table have non changing widths of columns”
- “make the refresh buttion in overvoew and emoloyees page same look”

**AI-assisted activities:** Explore layout and interaction changes, identify responsive edge cases, and review shared component styling.

**Human review and decisions:**
- Keep the application focused on Overview and Employees.
- Preserve the existing API and compensation calculations when changing chart interactions.
- Use the primary color as the only accent for the requested metric-card treatment.
- Test responsive layouts at narrow mobile widths rather than assuming desktop layout will simply shrink.

**Verification:** UI changes were reviewed against the live source and existing page/component structure. Browser visual verification should be recorded separately for each final responsive change.

## 3. Backend, database and migration work

**Objective:** Build a typed API and maintain a relational data model.

**AI-assisted activities:** Explore TypeScript/Prisma ORM patterns, debug migration and contract configuration errors, and review employee and analytics service behavior.

**Human review and decisions:**
- Inspect generated schema and migration output before accepting it.
- Preserve a single source of truth in PostgreSQL.
- Use database-side pagination and aggregation.
- Ensure soft-deleted employees are excluded from active results.
- Keep salary analytics scoped to a country and its local currency.

**Verification:** API validators, employee service, analytics service, contract definition and integration tests are committed in the repository. Database migration correctness still requires execution against the configured test database.

## 4. Testing and quality

**Objective:** Test business behavior rather than only implementation details.

**AI-assisted activities:** Identify missing validation, CRUD, analytics, empty-state and cross-chart interaction scenarios; propose focused test cases.

**Human review and decisions:**
- Prefer deterministic test data and explicit assertions.
- Keep PostgreSQL integration tests separate from fast unit tests.
- Do not claim test coverage or passing results without running the relevant command.
- Treat the benchmark as an experiment with documented environment and methodology, not as a marketing claim.

**Verification:** Automated test files and commands are linked from the README. The engineering-evidence branch adds targeted analytics validation and frontend API contract tests.

## 5. Performance investigation

**Objective:** Verify the assessment's 10,000-employee workload.

**AI-assisted activities:** Identify representative endpoint scenarios and a repeatable latency measurement approach.

**Human review and decisions:**
- Benchmark the actual API and database rather than estimate from source code.
- Include warm-up requests and report p50/p95, iteration count and environment.
- Measure search separately because leading-wildcard substring matching has different index behavior from equality filters.
- Do not add indexes until query plans and timings justify them.

**Verification:** [performance.md](./performance.md) records a completed local benchmark against 10,000 active employees: seven API scenarios, each with 5 warm-up requests and 30 measured requests. The report includes mean, p50, p95, minimum and maximum latency, plus the environment and methodology limitations. These are local API measurements, not production latency or a concurrency/load-test result.

## 6. Responsible use and limitations

- AI suggestions are treated as drafts, not authority.
- Existing code, schemas, assessment requirements and test output take precedence over generated assumptions.
- No synthetic benchmark results, fabricated test outcomes or invented historical prompts are included.
- Human review is required for database migrations, security-sensitive changes and changes to salary calculations.
