# Vizor — Data Models

## Scenario Structure

A scenario is the top-level container. Each scenario is stored as a single JSON file in `data/scenarios/`.

```typescript
interface Scenario {
  name: string;                    // Display name, also used as filename (slugified)
  description: string;             // Optional user notes
  config: ScenarioConfig;
  basedOn: string | null;          // Name of baseline scenario, or null if this IS the baseline
  models: Model[];                 // All financial models in this scenario
}

interface ScenarioConfig {
  startYear: number;               // First year of projection
  endYear: number;                 // Last year of projection
  cpiRate: number;                 // Default annual inflation rate (percent), from defaults.json
}
```

## Model Types

Every model has a shared base, then type-specific fields.

```typescript
// Union type — a Model is one of these
type Model =
  | SalaryModel
  | RecurringExpenseModel
  | OneTimeExpenseModel
  | OneTimeIncomeModel
  | MortgageModel
  | CarLoanModel
  | RetirementAccountModel
  | SocialSecurityModel;

// Shared across all model types
interface ModelBase {
  id: string;                      // UUID
  type: ModelType;
  enabled: boolean;                // Can be toggled off in scenarios
  description: string;             // User-provided label
}

type ModelType =
  | 'salary'
  | 'recurring_expense'
  | 'onetime_expense'
  | 'onetime_income'
  | 'mortgage'
  | 'car_loan'
  | 'retirement_account'
  | 'social_security';

type IncreaseType = 'percent' | 'flat';
```

### Salary / Income

```typescript
interface SalaryModel extends ModelBase {
  type: 'salary';
  amount: number;                  // Annual take-home pay
  startYear: number;
  endYear: number;
  increaseType: IncreaseType;      // Default: 'percent'
  increaseRate: number;            // Default: CPI rate
}
```

**Cash flow category:** Income

### Recurring Expense

```typescript
interface RecurringExpenseModel extends ModelBase {
  type: 'recurring_expense';
  amount: number;                  // Annual expense amount
  startYear: number;
  endYear: number;
  increaseType: IncreaseType;      // Default: 'percent'
  increaseRate: number;            // Default: CPI rate
}
```

**Cash flow category:** Expense

### One-Time Expense

```typescript
interface OneTimeExpenseModel extends ModelBase {
  type: 'onetime_expense';
  amount: number;
  year: number;
}
```

**Cash flow category:** Expense (single year only)

### One-Time Income

```typescript
interface OneTimeIncomeModel extends ModelBase {
  type: 'onetime_income';
  amount: number;
  year: number;
}
```

**Cash flow category:** Income (single year only)

### Home Mortgage

```typescript
interface MortgageModel extends ModelBase {
  type: 'mortgage';
  loanAmount: number;
  interestRate: number;            // Annual rate as percent (e.g., 5.0)
  termYears: number;               // e.g., 30
  startYear: number;               // Year the mortgage began
}
```

**Cash flow category:** Expense (calculated annual payment from amortization)

**Derived values:**
- Annual payment is calculated from loan amount, rate, and term using standard amortization formula.
- Expense runs from `startYear` through `startYear + termYears - 1`.

### Car Loan

```typescript
interface CarLoanModel extends ModelBase {
  type: 'car_loan';
  loanAmount: number;
  interestRate: number;            // Annual rate as percent
  termYears: number;               // e.g., 5
  startYear: number;
}
```

**Cash flow category:** Expense (calculated annual payment from amortization)

**Derived values:** Same as mortgage — standard amortization.

### Retirement / Investment Account

```typescript
interface RetirementAccountModel extends ModelBase {
  type: 'retirement_account';
  currentBalance: number;
  balanceAsOfYear: number;         // Year the balance reflects
  growthRate: number;              // Expected annual return as percent (e.g., 6.0)
  contributions: Schedule | null;
  distributions: Schedule | null;
}

interface Schedule {
  amount: number;                  // Annual contribution or distribution amount
  startYear: number;
  endYear: number;
  increaseType: IncreaseType;      // Default: 'percent'
  increaseRate: number;            // Default: 0 for contributions, CPI for distributions
}
```

**Cash flow categories:**
- Contributions → Expense (money leaving cash flow into the account)
- Distributions → Income (money coming from the account into cash flow)

**Balance tracking:** The account balance is tracked year-over-year and reported separately from cash flow (it contributes to net worth, not yearly income/expense).

### Social Security

```typescript
interface SocialSecurityModel extends ModelBase {
  type: 'social_security';
  annualBenefit: number;           // Estimated annual benefit at start
  startYear: number;               // Year benefits begin
  endYear: number;                 // Defaults to scenario end year
  increaseRate: number;            // Annual COLA percent, defaults to CPI or socialSecurityCOLA from defaults
}
```

**Cash flow category:** Income

## Defaults Configuration

Stored in `data/defaults.json`. All values are suggestions and can be overridden per-model.

```typescript
interface Defaults {
  cpiRate: number;                 // Default: 3.0
  estimatedTaxRate: number;        // Default: 25.0 (informational only, not used in calculations)
  typicalCosts: {                  // Reference values shown to users during model creation
    utilities: number;             // Default: 6000
    householdExpenses: number;     // Default: 12000
    autoInsurance: number;         // Default: 2400
    healthInsurance: number;       // Default: 8000
    homeownersInsurance: number;   // Default: 2000
  };
  retirementGrowthRate: number;    // Default: 6.0
  socialSecurityCOLA: number;      // Default: 2.5
}
```

## Calculation Output

The calculation engine takes a `Scenario` and produces this output, which the frontend uses for charts and tables.

```typescript
interface CalculationOutput {
  scenarioName: string;
  years: YearData[];
  accountBalances: AccountBalanceYear[];  // Retirement/investment account tracking
}

interface YearData {
  year: number;
  incomes: LineItem[];             // All income line items for this year
  expenses: LineItem[];            // All expense line items for this year
  totalIncome: number;             // Sum of incomes
  totalExpenses: number;           // Sum of expenses (as positive number)
  yearlyNet: number;               // totalIncome - totalExpenses
  cumulativeNet: number;           // Running sum of yearlyNet across all years
}

interface LineItem {
  modelId: string;
  description: string;
  amount: number;
}

interface AccountBalanceYear {
  modelId: string;
  description: string;
  year: number;
  startingBalance: number;
  contributions: number;
  distributions: number;
  growth: number;
  endingBalance: number;
}
```
