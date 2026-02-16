# Vizor — Claude Code Build Instructions

## Overview

This document is the build plan for Vizor. Work through the tasks in order. Each task is a self-contained prompt you can paste directly into Claude Code.

Before starting, place the `docs/` folder and `data/` folder in the root of your project repository. Claude Code references spec documents by path.

## Tips for Working with Claude Code

- **One task per session.** Don't combine tasks. Verify each is working before moving on.
- **If something breaks, fix it before moving on.** Send Claude Code the error output and ask it to debug.
- **Review generated code.** Skim what it produces, especially the calculation engine. Check a few numbers against a calculator.
- **If Claude Code goes off-track**, re-anchor it: "Read docs/CALCULATION_ENGINE.md again and follow the formula for retirement accounts exactly."
- **For mid-task adjustments**, be specific: "In the salary form, change the default increase type from percent to flat" rather than "make some changes to the forms."
- **Keep the spec docs updated.** If you make a decision during development that changes the spec, update the doc so future tasks stay consistent.

---

## Task 1: Project Scaffolding and Data Layer

### Spec References
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODELS.md`

### Prompt

```
Read the following spec documents:
- docs/ARCHITECTURE.md
- docs/DATA_MODELS.md

Set up the Vizor project following the project structure in ARCHITECTURE.md.
Create all TypeScript type definitions from DATA_MODELS.md.
Implement the JSON file storage layer and Express API routes.
Create data/defaults.json and a sample data/scenarios/baseline.json
with a salary model, a recurring expense, and a retirement account.
Set up the React client with Vite.

Acceptance criteria:
- npm install and npm run dev starts both server and client
- All API endpoints work for scenario CRUD and defaults
- React app fetches and displays the scenario list
```

---

## Task 2: Calculation Engine

### Spec References
- `docs/CALCULATION_ENGINE.md`
- `docs/DATA_MODELS.md` (specifically CalculationOutput types)

### Prompt

```
Read the following spec documents:
- docs/CALCULATION_ENGINE.md
- docs/DATA_MODELS.md (specifically CalculationOutput types)

Implement the calculation engine in server/src/engine/.
Create a calculator for each model type following the logic
in CALCULATION_ENGINE.md exactly. Wire the calculator into the
GET /api/scenarios/:name endpoint so it returns both raw scenario
data and calculated output.

Write unit tests for:
- Salary with percent increase
- Mortgage payment matching standard amortization
- Retirement account with contributions, distributions, and growth
- Retirement account with balanceAsOfYear before scenario startYear
- Disabled models producing no output
- Correct cumulative net calculation

Acceptance criteria:
- All tests pass
- GET /api/scenarios/baseline returns correct calculated output
```

---

## Task 3: Charts

### Spec References
- `docs/UI_SPEC.md` (Chart View section)
- `docs/ARCHITECTURE.md` (Recharts as charting library)

### Prompt

```
Read docs/UI_SPEC.md, specifically the Chart View section.

Using Recharts, implement:
1. A line chart with four lines (Total Income, Total Expenses,
   Yearly Net, Cumulative Net) with the colors and styles specified
2. A stacked bar chart with income above zero, expenses below zero,
   and overlay lines for Yearly Net and Cumulative Net

Both charts should render from the calculation output returned
by GET /api/scenarios/:name. Apply the formatting standards
from UI_SPEC.md.

Acceptance criteria:
- Both charts render with correct data from the baseline scenario
- Tooltips, legends, and formatting work correctly
- Negative values display properly
- Charts look reasonable on a standard laptop screen width
```

---

## Task 4: Model Entry Forms

### Spec References
- `docs/UI_SPEC.md` (Template Picker, Form Fields by Model Type, Scenario Management)
- `docs/DATA_MODELS.md` (Model type definitions for validation)

### Prompt

```
Read docs/UI_SPEC.md, specifically the Template Picker and
Form Fields by Model Type sections.

Build the model entry system:
1. Template picker for selecting model type
2. A form for each model type using the exact field labels
   and defaults from the spec
3. Left sidebar with model list grouped by category
4. Enable/disable toggle per model
5. Saving a model updates the scenario via API and refreshes charts

Use data/defaults.json values to pre-fill default rates
and show hint text for typical costs.

Acceptance criteria:
- Can add each model type via template picker
- Forms show correct labels, defaults, and hints
- Save updates scenario and charts refresh
- Toggle immediately updates charts
- Validation prevents saving invalid data
- Mortgage/car loan forms show calculated payment
```

---

## Task 5: Scenario Management

### Spec References
- `docs/UI_SPEC.md` (Scenario Management section)
- `docs/ARCHITECTURE.md` (API endpoints)

### Prompt

```
Read docs/UI_SPEC.md — Scenario Management section,
and docs/ARCHITECTURE.md — API endpoints.

Implement scenario management:
1. Scenario picker dropdown in the top bar
2. Create new scenario (empty or based on existing)
3. Duplicate scenario
4. Switch between scenarios
5. Delete with confirmation

Acceptance criteria:
- Full lifecycle works: create, switch, duplicate, delete
- Duplicated scenarios are independent copies
- UI updates correctly on scenario switch
```

---

## Task 6: Scenario Comparison

### Spec References
- `docs/UI_SPEC.md` (Scenario Comparison View section)

### Prompt

```
Read docs/UI_SPEC.md — Scenario Comparison View section.

Build the comparison view:
1. "Compare" button opening a scenario multi-select
2. Vertically stacked line charts, one per selected scenario
3. Cumulative Net overlay chart at the bottom with all
   scenarios on the same axes
4. Synchronized X-axis range across all charts

Acceptance criteria:
- Can compare 2-4 scenarios
- Individual charts and overlay chart render correctly
- Scenarios are clearly labeled
```

---

## Task 7: Data Table and Export

### Spec References
- `docs/UI_SPEC.md` (Data Table View section)

### Prompt

```
Read docs/UI_SPEC.md — Data Table View section.

Build the data table:
1. Rows for each model and summary rows
2. Year columns with sticky first column
3. Dollar formatting, negative values in red
4. CSV export

Acceptance criteria:
- Table data matches chart data
- Horizontal scroll with sticky labels
- CSV downloads correctly
```

---

## Task 8: Polish and Refinement

### Spec References
- All docs (review against full spec)

### Prompt

```
Review the full application against all spec documents in docs/.

Focus on:
1. Consistent styling across all components
2. Loading and error states for all API calls
3. Empty states with helpful guidance when no scenarios or models exist
4. Settings view for editing defaults.json values
5. README with setup instructions

Acceptance criteria:
- Professional, consistent appearance
- No unhandled errors visible to the user
- New user can clone the repo and run the app from the README
```
