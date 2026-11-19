# ACME People — Product Requirements

## Goal
Replace ACME's spreadsheet-based salary administration with a web application that lets an HR Manager manage employee salary records for a 10,000-person, multi-country organization and answer practical questions about how the organization pays people.

## Primary user
**HR Manager:** needs a reliable, searchable employee register and clear compensation summaries without reconciling multiple spreadsheets.

## In scope
1. **Employee directory**
   - Browse employees with server-side pagination.
   - Search by employee name or email.
   - Filter by country and job title.
   - View an employee record and create, edit, or soft-delete it.
2. **Compensation overview**
   - Show active workforce totals across the supported markets.
   - Compare employee distribution by country.
   - Show country-level minimum, average, and maximum annual salary.
   - Break down employee count and average annual salary by job title within a selected country.
   - Display each country's salary values in its own currency; do not add or rank unlike currencies as though they were one amount.
3. **Data and scale**
   - Use a relational database and a backend API.
   - Seed exactly 10,000 synthetic employees in repeatable batches.
   - Exclude soft-deleted employees from active lists and analytics.
4. **Quality and delivery**
   - Add meaningful, deterministic tests for core behavior.
   - Keep code structured and maintainable.
   - Deploy the working application and provide a short product demo.
   - Preserve an incremental, understandable Git commit history.

## Deliberately out of scope
- **Payroll processing, payslips, tax calculation and statutory filings:** these are separate country-specific workflows and are not needed to manage salary records or answer the assessment's compensation questions.
- **Attendance, leave, recruitment and performance management:** they do not solve the stated spreadsheet salary-management problem.
- **Authentication and role-based access control:** deferred to keep the assessment focused on the core HR workflows. This is not a production security recommendation.
- **Salary benchmarking against external market data:** no trusted benchmark source or methodology is supplied.
- **Cross-currency payroll totals and currency conversion:** mixing INR, USD, GBP, EUR and CAD without an explicit exchange-rate source and reporting date would be misleading.
- **Historical salary trends and change approvals:** the current data model does not capture salary history or approval events, so those insights cannot be calculated honestly.

## Product and engineering decisions
- Treat country as the reporting boundary for salary analytics because each country has a different currency.
- Calculate summaries from active employee records so updates are reflected without maintaining a second source of truth.
- Use server-side search, filtering and pagination so the employee directory remains responsive at 10,000 records.
- Use deterministic synthetic seed data and batch inserts to make demos repeatable and avoid one large insert.
- Prefer a small number of complete, tested workflows over adding unrelated HR modules.
