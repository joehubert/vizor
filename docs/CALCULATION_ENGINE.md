# Vizor — Calculation Engine

## Overview

The calculation engine takes a `Scenario` and produces a `CalculationOutput`. It iterates through every year in the scenario's range and computes the financial impact of each enabled model.

## Processing Steps

```
1. Read scenario config (startYear, endYear, cpiRate)
2. Filter to enabled models only
3. For each year in [startYear .. endYear]:
   a. For each model, calculate its contribution to that year
   b. Categorize each result as income or expense
   c. Sum totals
   d. Compute cumulative running total
4. For retirement/investment accounts, track balances separately
5. Return CalculationOutput
```

## Model Calculation Logic

### Common: Increase Calculation

Many models use an increase applied year-over-year. This is a shared utility.

```
function applyIncrease(baseAmount, increaseType, increaseRate, yearsElapsed):
    if yearsElapsed == 0:
        return baseAmount
    if increaseType == 'percent':
        return baseAmount * (1 + increaseRate / 100) ^ yearsElapsed
    if increaseType == 'flat':
        return baseAmount + (increaseRate * yearsElapsed)
```

### CPI Default Behavior

If a model's `increaseRate` is not explicitly set by the user, it defaults to the scenario's `cpiRate`. The engine should treat the scenario's `cpiRate` as the fallback for any model that supports increases.

Implementation note: In the stored JSON, the `increaseRate` will always have an explicit value (set to CPI at creation time). The defaulting happens in the UI when creating a model, not in the engine. The engine always uses the stored value.

---

### Salary / Income

```
Category: Income
Active years: [startYear .. endYear]

For a given year:
    yearsElapsed = year - startYear
    amount = applyIncrease(model.amount, model.increaseType, model.increaseRate, yearsElapsed)

Output: LineItem with amount as income
```

### Recurring Expense

```
Category: Expense
Active years: [startYear .. endYear]

For a given year:
    yearsElapsed = year - startYear
    amount = applyIncrease(model.amount, model.increaseType, model.increaseRate, yearsElapsed)

Output: LineItem with amount as expense
```

### One-Time Expense

```
Category: Expense
Active years: [year] only

For a given year:
    if year == model.year:
        amount = model.amount
    else:
        amount = 0 (no line item)

Output: LineItem with amount as expense (only in the matching year)
```

### One-Time Income

```
Category: Income
Active years: [year] only

For a given year:
    if year == model.year:
        amount = model.amount
    else:
        amount = 0 (no line item)

Output: LineItem with amount as income (only in the matching year)
```

### Home Mortgage

```
Category: Expense
Active years: [startYear .. startYear + termYears - 1]

Setup (once):
    monthlyRate = (model.interestRate / 100) / 12
    totalPayments = model.termYears * 12
    monthlyPayment = model.loanAmount * (monthlyRate * (1 + monthlyRate)^totalPayments)
                     / ((1 + monthlyRate)^totalPayments - 1)
    annualPayment = monthlyPayment * 12

For a given year:
    if year >= model.startYear AND year < model.startYear + model.termYears:
        amount = annualPayment
    else:
        amount = 0

Output: LineItem with annualPayment as expense
```

Note: The annual payment is fixed for the life of the mortgage (standard fixed-rate amortization). The engine does not need to track principal vs. interest breakdown since we're only concerned with cash flow impact.

### Car Loan

```
Category: Expense
Active years: [startYear .. startYear + termYears - 1]

Calculation: Identical to mortgage. Same amortization formula.

Output: LineItem with annualPayment as expense
```

### Retirement / Investment Account

This is the most complex model. It has three aspects: contributions (expense), distributions (income), and balance tracking (separate from cash flow).

```
Category: Contributions are Expense; Distributions are Income
Active years: determined by contribution and distribution schedule ranges

BALANCE TRACKING (per year, sequentially — order matters):

    For the first relevant year (balanceAsOfYear):
        startingBalance = model.currentBalance

    For each subsequent year:
        startingBalance = previous year's endingBalance

    contributionAmount = 0
    if contributions schedule exists AND year in [contributions.startYear .. contributions.endYear]:
        yearsElapsed = year - contributions.startYear
        contributionAmount = applyIncrease(contributions.amount, contributions.increaseType,
                                           contributions.increaseRate, yearsElapsed)

    distributionAmount = 0
    if distributions schedule exists AND year in [distributions.startYear .. distributions.endYear]:
        yearsElapsed = year - distributions.startYear
        distributionAmount = applyIncrease(distributions.amount, distributions.increaseType,
                                           distributions.increaseRate, yearsElapsed)
        availableForDistribution = startingBalance + contributionAmount
        distributionAmount = min(distributionAmount, availableForDistribution)

    balanceAfterFlows = startingBalance + contributionAmount - distributionAmount
    growth = balanceAfterFlows * (model.growthRate / 100)
    endingBalance = balanceAfterFlows + growth

CASH FLOW OUTPUT:
    - If contributionAmount > 0: LineItem as expense (money leaving cash flow)
    - If distributionAmount > 0: LineItem as income (money entering cash flow)

BALANCE OUTPUT:
    - AccountBalanceYear record with all balance details
```

**Important edge cases:**
- If `balanceAsOfYear` is before `startYear`, the engine must forward-calculate the balance from `balanceAsOfYear` to `startYear` before generating output. During these pre-scenario years, contributions and distributions still apply if their schedules overlap.
- Distribution amount is capped at `startingBalance + contributionAmount`. When insufficient funds for the planned distribution, the actual distribution equals the available balance; the account is depleted and no negative balance is produced. In later years of the schedule, distributions are 0 until contributions refill the account.
- Growth is applied AFTER contributions and distributions for that year.

### Social Security

```
Category: Income
Active years: [startYear .. endYear]

For a given year:
    yearsElapsed = year - startYear
    amount = model.annualBenefit * (1 + model.increaseRate / 100) ^ yearsElapsed

Output: LineItem with amount as income
```

Note: Social Security always uses percent increase (COLA). The `increaseRate` defaults to `socialSecurityCOLA` from defaults.json.

---

## Aggregation

After computing all model line items for a year:

```
totalIncome = sum of all income LineItem amounts
totalExpenses = sum of all expense LineItem amounts
yearlyNet = totalIncome - totalExpenses
cumulativeNet = previous year's cumulativeNet + yearlyNet
    (for the first year, cumulativeNet = yearlyNet)
```

## Output Structure

See `CalculationOutput`, `YearData`, `LineItem`, and `AccountBalanceYear` types in DATA_MODELS.md.

## Testing Strategy

The calculation engine should be testable independently of the API or UI. Tests should:

1. Create a Scenario object in code (not from a file)
2. Pass it to the calculator
3. Assert specific year values in the output

**Key test cases:**
- Single salary model: verify year-over-year increase
- Mortgage: verify annual payment matches known amortization calculator
- Retirement account: verify balance growth with contributions only, distributions only, and both
- Retirement account: verify contributions appear as expenses and distributions as income
- Mixed scenario: verify totals, yearly net, and cumulative net
- Edge case: retirement account with balanceAsOfYear before scenario startYear
- Edge case: model with start/end years partially outside scenario range (should only produce output for overlapping years)
- Disabled model: verify it produces no output
