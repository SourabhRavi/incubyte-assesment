# Testing Guide

This guide describes the automated checks available in ACME People and the one-command PostgreSQL integration test path prepared for the Incubyte assessment.

## Quick start: run the checks

Run these commands from the repository root:

```bash
npm --prefix server test
npm --prefix server run typecheck
npm --prefix client run lint
npm --prefix client test
npm --prefix client run build
npm --prefix server run test:integration
```

The backend unit tests and frontend checks run locally without a PostgreSQL test database. The integration test uses the dedicated Neon test branch configured for this assessment.

## Integration test

The integration test is located at `server/tests/employee.api.integration.ts`. Its script is:

```bash
npm --prefix server run test:integration
```

The test loads `server/.env.test` before importing the application and database client. The assessment repository includes a connection configuration for a dedicated, disposable Neon test branch, so an evaluator does not need to create a Neon project, provision PostgreSQL, apply the schema, or seed 10,000 rows to run this test.

The integration test exercises the real Express application and PostgreSQL database:

- Create an employee and verify generated country currency.
- Retrieve the employee by ID.
- Search by name and case-insensitive email.
- Combine search, country, and job-title filters.
- Verify conflicting filters return no results.
- Verify pagination totals and invalid search validation.
- Update country, job title, and salary.
- Verify country salary summary and job-title average calculations.
- Soft-delete the employee and verify it disappears from active lists, search, and analytics.

The test uses a unique email for each run. It soft-deletes the created employee after the assertions, and its `finally` cleanup attempts the same operation if an earlier assertion fails. Soft-deleted test rows remain in the database but are excluded from active employee views and aggregates.

## Test database boundaries

The Neon database is a dedicated assessment test environment, not the application's production database. It must contain only synthetic/test data. The integration-test role is intended for the operations performed by this test.

- Do not point integration tests at production.
- Do not use the test role for application runtime, schema migrations, or seeding.
- Do not store production credentials or real employee data in the test branch.
- Rotate or revoke the assessment test role after the evaluation window.

The test role needs access to the employee table and its sequences for the CRUD workflow. It does not need schema ownership or permission to alter the database schema.

## What the integration test does not do

The integration test does not initialize or migrate the schema and does not seed the 10,000-employee benchmark dataset. It expects the assessment test database to already have the current schema. The test captures baseline counts and salary aggregates, adds one unique employee, verifies the changed values, and soft-deletes that employee.

## Benchmark

The read-only 10,000-employee API benchmark is separate from the test suite. Follow [performance.md](./performance.md) for setup, workload, recorded results, and limitations.
