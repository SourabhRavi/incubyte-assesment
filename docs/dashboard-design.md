# ACME People — Dashboard Design & Interaction Notes

## Product direction
Premium enterprise, light-first, information-dense but calm. The dashboard should feel like an operational workspace for an HR Manager, not a marketing page. Use a compact navigation rail, restrained blue primary actions, neutral surfaces, clear data hierarchy, and consistent tabular number alignment.

## Information architecture
- **Overview:** workforce distribution across supported markets, market-specific salary profile, role-level salary comparison and workforce mix.
- **Employees:** searchable and filterable employee directory with create, inspect, edit and soft-delete flows.
- Keep payroll, attendance, leave and recruitment out of the navigation because they are outside the assessment scope.

## Overview screen

### 1. Page header
- Title: Compensation overview.
- Context: ACME / People operations.
- Market selector for the detailed salary view.
- Refresh action with disabled/loading feedback.

### 2. Global KPI strip
- Global workforce: sum of active employee counts across all supported markets.
- Markets covered: count of supported countries.
- Largest market: country with the highest active employee count.
- Average salary: average for the selected market, explicitly labelled with its currency.

### 3. Workforce by market
- One row per supported country.
- Show active employee count, share of global headcount and average salary in that country's local currency.
- Scale bars against the largest market.
- Never add local-currency averages together or imply they are directly comparable.

### 4. Salary profile
- For the selected country, show minimum, average and maximum annual salary.
- Include active employee count and currency.
- Keep the country selector as the single source of truth for the detailed salary panels.

### 5. Average salary by role
- Horizontal comparison bars, scaled to the highest average in the selected market.
- Show employee count and average annual salary for each job title.
- Use actual API values, not decorative sample data.

### 6. Workforce mix
- Donut visualization of employee count by job title for the selected market.
- Keep a visible legend with role names and counts so the visualization is understandable without relying on color.

### 7. Role-level detail table
- Job title, employee count and average annual salary.
- Repeat the selected country and currency in the table context.
- Exclude soft-deleted employees, consistent with the API.

## Interaction and state behavior
- Changing the market updates the salary profile, role comparison, workforce mix and role table together.
- Global workforce distribution remains across all supported markets.
- Refresh reloads both global and selected-market queries.
- Show loading, empty and recoverable error states. Never replace a failed API response with invented zeroes.
- If one market cannot load, show the unavailable row and do not present a partial sum as the global workforce total.

## Data boundaries
The current analytics API exposes:
- Active employee count, minimum salary, maximum salary and average salary by country.
- Employee count and average salary grouped by job title within a country.

It does not expose salary history, department, payroll totals, exchange rates, missing-field audits or compensation bands. The dashboard intentionally does not fabricate those metrics. A future extension should add explicit backend contracts and tests before introducing those visualizations.

## Responsive behavior
- Wide desktop: two-column analytical layout with the global market comparison receiving more width.
- Tablet: analytical panels stack or become equal-width where space permits.
- Mobile: single-column cards, wrapped controls and horizontally scrollable detail table.
- Preserve readable chart labels and do not shrink critical numbers to fit.

## Accessibility
- Keep labels associated with controls.
- Use semantic headings, table headers and alert roles.
- Provide accessible labels for SVG charts.
- Pair color encoding with visible labels and numeric values.
- Preserve keyboard operation and visible focus treatment through the existing component system.

## Performance and implementation
- Reuse TanStack Query cache keys and existing analytics endpoints.
- Fetch the five country summaries through the existing multi-query hook.
- Keep employee listing server-paginated; do not load all 10,000 employees into the browser to calculate dashboard totals.
- Avoid a new chart dependency when the existing SVG visualizations and component stack are sufficient.
