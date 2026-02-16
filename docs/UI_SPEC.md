# Vizor — UI Specification

## Layout

The application has a simple layout:

```
┌─────────────────────────────────────────────────┐
│  Vizor                        [Scenario Picker]  │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│  Model   │         Main Content Area             │
│  List    │                                       │
│          │   (Charts / Data Table / Comparison)   │
│  [+ Add] │                                       │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

- **Left sidebar:** List of models in the current scenario, grouped by category (Income, Expenses, Accounts). Each model shows its description and can be clicked to edit. An "Add Model" button opens the template picker.
- **Top bar:** Application name, current scenario name with a dropdown to switch scenarios, and buttons for "New Scenario", "Duplicate", "Compare".
- **Main content area:** Displays the active view — charts (default), data table, or scenario comparison.

## Views

### 1. Chart View (Default)

Displayed when viewing a single scenario. Contains two charts stacked vertically.

#### Line Chart (Top)
- X-axis: Years (from scenario startYear to endYear)
- Y-axis: Dollar amount (formatted with $ and commas)
- Four lines:
  - **Total Income** — green
  - **Total Expenses** — red
  - **Yearly Net** — blue
  - **Cumulative Net** — dark blue, thicker line weight
- Legend at top
- Tooltip on hover showing all values for that year
- Y-axis should accommodate negative values (cumulative net may go negative)

#### Stacked Bar Chart (Bottom)
- X-axis: Years
- Y-axis: Dollar amount
- Bars above zero: income sources stacked (each model a different color)
- Bars below zero: expense sources stacked (each model a different color)
- Overlay lines: Yearly Net and Cumulative Net
- Legend identifying each model
- Tooltip on hover showing individual model amounts

### 2. Data Table View

Toggled via a "Table" tab or button. Shows the raw numbers behind the charts.

- **Rows:** Each model (grouped by category), then summary rows: Total Income, Total Expenses, Yearly Net, Cumulative Net
- **Columns:** One per year
- **Cells:** Dollar amounts, formatted with $ and commas. Negative values in red.
- **Sticky first column** (model descriptions) so the user can scroll horizontally through years
- **Export button:** Download as CSV

### 3. Scenario Comparison View

Accessed via the "Compare" button. User selects 2-4 scenarios to compare.

**Layout:**
```
┌──────────────────────────────────┐
│  Scenario: Baseline              │
│  [Full line chart]               │
├──────────────────────────────────┤
│  Scenario: Early Retirement      │
│  [Full line chart]               │
├──────────────────────────────────┤
│  Scenario: Delay Retirement      │
│  [Full line chart]               │
├──────────────────────────────────┤
│  Comparison: Cumulative Net      │
│  [Overlay chart — one line per   │
│   scenario, same axes]           │
└──────────────────────────────────┘
```

- Each scenario gets its own line chart (same format as Chart View)
- The bottom overlay chart plots ONLY the Cumulative Net line from each scenario, with different colors and a legend identifying each scenario
- All charts share the same X-axis range (the widest range across selected scenarios) and ideally the same Y-axis scale for easy visual comparison

## Model Forms

When adding or editing a model, a form panel appears (either as a slide-over panel from the right or a modal). Each model type has its own form with type-specific fields and friendly labels.

### Template Picker

When clicking "Add Model", the user sees a grid or list of model types to choose from:

| Icon/Label | Type Key |
|------------|----------|
| Salary / Income | `salary` |
| Recurring Expense | `recurring_expense` |
| One-Time Expense | `onetime_expense` |
| One-Time Income | `onetime_income` |
| Home Mortgage | `mortgage` |
| Car Loan | `car_loan` |
| Retirement / Investment Account | `retirement_account` |
| Social Security | `social_security` |

### Form Fields by Model Type

Each form should have a "Save" and "Cancel" button. Fields with defaults should be pre-filled. Required fields should be validated before save.

#### Salary / Income
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "What's this income source?" | description | — | Yes |
| "Annual take-home pay" | amount | — | Yes |
| "Start year" | startYear | Current year | Yes |
| "End year" | endYear | — | Yes |
| "How does it grow?" | increaseType | percent | Yes |
| "Annual raise (%)" or "Annual raise ($)" | increaseRate | CPI rate | Yes |

The increase rate label should change based on the selected increase type.

#### Recurring Expense
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "What's this expense?" | description | — | Yes |
| "Annual amount" | amount | — | Yes |
| "Start year" | startYear | Current year | Yes |
| "End year" | endYear | Scenario end year | Yes |
| "How does it grow?" | increaseType | percent | Yes |
| "Annual increase (%)" or "Annual increase ($)" | increaseRate | CPI rate | Yes |

For common expense types (utilities, household, insurance), show the typical cost from defaults.json as a hint below the amount field: "Typical US household: ~$6,000/year"

#### One-Time Expense
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "What's this expense?" | description | — | Yes |
| "Amount" | amount | — | Yes |
| "Year" | year | Current year | Yes |

#### One-Time Income
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "What's this income?" | description | — | Yes |
| "Amount (net)" | amount | — | Yes |
| "Year" | year | — | Yes |

#### Home Mortgage
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "Which property?" | description | — | Yes |
| "Loan amount" | loanAmount | — | Yes |
| "Interest rate (%)" | interestRate | — | Yes |
| "Term (years)" | termYears | 30 | Yes |
| "Start year" | startYear | — | Yes |

Show the calculated monthly and annual payment as a read-only display below the form fields once enough info is entered.

#### Car Loan
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "Which vehicle?" | description | — | Yes |
| "Loan amount" | loanAmount | — | Yes |
| "Interest rate (%)" | interestRate | — | Yes |
| "Term (years)" | termYears | 5 | Yes |
| "Start year" | startYear | Current year | Yes |

Show calculated monthly and annual payment (same as mortgage).

#### Retirement / Investment Account
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "Which account?" | description | — | Yes |
| "Current balance" | currentBalance | — | Yes |
| "Balance as of year" | balanceAsOfYear | Current year | Yes |
| "Expected annual return (%)" | growthRate | retirementGrowthRate from defaults | Yes |
| **Contributions** | | | |
| "Annual contribution" | contributions.amount | — | No* |
| "Contributions start year" | contributions.startYear | Current year | No* |
| "Contributions end year" | contributions.endYear | — | No* |
| "How do contributions grow?" | contributions.increaseType | percent | No* |
| "Annual increase" | contributions.increaseRate | 0 | No* |
| **Distributions** | | | |
| "Annual withdrawal" | distributions.amount | — | No* |
| "Withdrawals start year" | distributions.startYear | — | No* |
| "Withdrawals end year" | distributions.endYear | Scenario end year | No* |
| "How do withdrawals grow?" | distributions.increaseType | percent | No* |
| "Annual increase" | distributions.increaseRate | CPI rate | No* |

*Contribution and distribution sections should be collapsible. If a section is left empty, the schedule is null.

#### Social Security
| Field Label | Maps To | Default | Required |
|-------------|---------|---------|----------|
| "Whose benefit?" | description | — | Yes |
| "Estimated annual benefit" | annualBenefit | — | Yes |
| "Start year" | startYear | — | Yes |
| "End year" | endYear | Scenario end year | Yes |
| "Annual COLA (%)" | increaseRate | socialSecurityCOLA from defaults | Yes |

Hint below the benefit field: "Check ssa.gov for your estimated benefit"

## Scenario Management

### Creating a Scenario
- User clicks "New Scenario"
- Prompted for name and description
- Optionally selects a baseline scenario to base it on
- If based on a baseline, all models are copied and the user can toggle/edit

### Editing Models in a Scenario
- Clicking a model in the sidebar opens its form
- Changes are saved to the scenario file
- Charts update after save

### Toggling Models
- Each model in the sidebar has an enable/disable toggle
- Disabled models are grayed out in the list and excluded from calculations
- Toggling immediately recalculates and updates charts

### Comparing Scenarios
- User clicks "Compare"
- A multi-select list of all scenarios appears
- User selects 2-4 scenarios and confirms
- Comparison view is displayed

## Formatting Standards

- Dollar amounts: `$1,234,567` (no cents)
- Percentages: `3.0%`
- Years: four-digit display, no commas
- Negative dollar amounts: displayed in red with parentheses `($12,345)` or with a minus sign
- Chart colors: use a consistent, accessible color palette. Avoid relying solely on color — use line styles (solid, dashed) or labels as well.
