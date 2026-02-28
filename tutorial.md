# Vizor Tutorial

Vizor is a personal finance projection tool that helps you model your financial future. You build a **scenario** — a collection of income sources, expenses, loans, and investment accounts — and Vizor projects your cash flow year by year, showing you where you're headed.

> **Before you start:** See [README.md](README.md) for installation instructions. Once you've run `npm install` and `npm run dev`, open http://localhost:5173 in your browser.

---

## Part 1: The Big Picture

When you open Vizor, you'll see three main areas:

- **Top bar** — the application name, a dropdown to switch between scenarios, and buttons to create, duplicate, or compare scenarios.
- **Left sidebar** — the list of financial models in the current scenario, grouped by category (Income, Expenses, Accounts). An **+ Add** button at the bottom lets you add new models.
- **Main content area** — charts (the default view), a data table, or a scenario comparison.

Everything in Vizor revolves around two core concepts:

- **Scenario** — the container for your financial projection. It has a name, a date range (start year to end year), and a list of models.
- **Model** — a single financial element inside a scenario: a salary, a recurring expense, a mortgage, a retirement account, etc.

---

## Part 2: Loading the Sample Scenario

The repo includes a sample data file to help you get oriented. To use it:

1. In the `data/scenarios/` directory, find `example.json.remove`.
2. Rename it to `example.json` (remove the `.remove` extension).
3. Refresh Vizor in your browser. The **"sample"** scenario (the Martinez family) will now appear in the scenario picker dropdown.

Select it and explore. You'll see a multi-decade projection for a fictional family — two salaries, a mortgage, childcare, college costs, retirement accounts, and Social Security. This is a good reference as you build your own scenarios.

---

## Part 3: Reading the Charts

The default view shows two charts stacked vertically.

### Line Chart (top)

This gives you the big-picture view of four key metrics over time:

| Line | Color | What it means |
|------|-------|---------------|
| Total Income | Green | Sum of all income sources each year |
| Total Expenses | Red | Sum of all expenses each year |
| Yearly Net | Blue | Income minus expenses for that year |
| Cumulative Net | Dark blue (thicker) | Running total of yearly net — your overall cash position |

Hover over any point on the chart to see all four values for that year.

The **Cumulative Net** line is the most important one to watch. When it goes negative, you're spending more than you've earned in total over the projection period — a sign you may need to adjust your plan.

### Stacked Bar Chart (bottom)

This breaks down the detail year by year:

- Bars **above zero** show your income sources stacked (each model gets its own color).
- Bars **below zero** show your expenses stacked.
- Overlay lines show Yearly Net and Cumulative Net for context.

Hover over any bar to see the individual amounts for each model in that year.

---

## Part 4: The Data Table

Click the **Table** tab to switch from charts to a spreadsheet-style view. This shows the exact dollar amounts behind the charts:

- Rows represent each model, grouped by category, followed by summary rows (Total Income, Total Expenses, Yearly Net, Cumulative Net).
- Columns represent each year in the scenario.
- Negative values appear in red.
- Scroll horizontally to move through the years; the model names stay fixed on the left.
- Use the **Export** button to download the data as a CSV file.

The data table is useful when you want to dig into specific numbers — for example, checking exactly when a loan is paid off or when retirement distributions kick in.

---

## Part 5: Creating Your First Scenario

### Step 1: Create a new scenario

Click **New Scenario** in the top bar. Give it a name, a start year, and an end year. A good starting point is the current year through your expected end of retirement (e.g., 2025–2060).

### Step 2: Add your income

Click **+ Add** in the sidebar, then choose **Salary / Income**. Fill in:

- A description (e.g., "My Salary")
- Your annual take-home pay
- The years it applies (start and end)
- How it grows each year — either by a percentage (e.g., 3% annual raise) or a flat dollar amount

Click **Save**. The model appears in the sidebar under Income, and the charts update immediately.

### Step 3: Add your expenses

Click **+ Add** again and choose **Recurring Expense**. Add your significant annual expenses — housing, utilities, insurance, food, etc. For each one, specify:

- A description
- Annual amount
- Start and end years
- Growth rate (expenses often grow with inflation — the default CPI rate is 3%)

Repeat for each major expense category.

### Step 4: Review the charts

After adding income and a few expenses, take a look at the line chart. Is the Cumulative Net line trending upward (healthy) or downward (concerning)? This real-time feedback is the core value of Vizor — you can see the impact of each model as you add it.

---

## Part 6: Model Types in Detail

Vizor supports eight model types. Here's when to use each:

### Salary / Income
Use for any recurring income: salary, wages, freelance income, rental income. Supports both percentage and flat-dollar annual growth.

### Recurring Expense
Use for any annual expense that repeats: mortgage payments, utilities, insurance, food, subscriptions. Can grow by percentage (inflation-linked) or flat amount, or stay fixed (set increase rate to 0 with type "flat").

### One-Time Expense
Use for a single large expense in a specific year: a car purchase, home renovation, medical bill, vacation. Appears only in that one year.

### One-Time Income
Use for a windfall or non-recurring income event: an inheritance, a bonus, selling an asset. Appears only in that one year.

### Home Mortgage
Use for a fixed-rate home loan. Vizor calculates the annual payment from the loan amount, interest rate, and term.

> You can model your mortgage payments as a fixed recurring expense. Calculate your monthly payment outside of Vizor (using your lender's figures or an online mortgage calculator), then multiply by 12 and enter that as the annual amount. Set the increase type to "flat" with a rate of 0, since a fixed-rate mortgage payment doesn't change year over year.

### Car Loan
Similar to Home Mortgage, but for vehicle financing.

> You can use the same approach as a mortgage — enter the annual payment amount (monthly payment × 12) as a flat recurring expense for the duration of the loan term.

### Retirement / Investment Account
Use for 401(k)s, IRAs, brokerage accounts, or any investment account. You specify:
- Current balance and the year that balance was recorded
- Annual growth rate (default: 6%)
- **Contributions** — how much you add each year, and for how long (counted as an expense in cash flow)
- **Distributions** — how much you withdraw each year in retirement, and a tax rate (distributions appear as income in cash flow after taxes)

This model tracks the account balance separately from your cash flow, so you can see both how much money you have and how it affects your income/expenses over time.

### Social Security
Use for government retirement benefits. Enter your estimated annual benefit at the start year, and Vizor projects it forward using the COLA (cost of living adjustment) rate (default: 2.5%).

---

## Part 7: Working with Multiple Scenarios

One of Vizor's most powerful features is the ability to compare different financial plans side by side.

### Duplicating a scenario

Once you have a baseline scenario you're happy with, use the **Duplicate** button to create a copy. Give it a meaningful name (e.g., "Early Retirement" or "Higher Savings Rate"). Then modify the copy — change model amounts, start/end years, or add/remove models — to represent an alternative plan.

### Comparing scenarios

Click the **Compare** button and select 2–4 scenarios. The comparison view shows:

- A full line chart for each selected scenario (same format as the normal chart view)
- A final overlay chart that plots the **Cumulative Net** line from each scenario on the same axes, so you can directly compare outcomes

This makes it easy to answer questions like: "What happens to my long-term financial position if I retire 5 years earlier?" or "How much does increasing my 401(k) contribution by $200/month change my retirement outlook?"

---

## Part 8: Tips and Best Practices

**Start with a baseline.** Build one complete scenario that represents your current plan before creating variations. The `basedOn` field on a scenario records which scenario it was derived from, helping you keep track of what changed.

**Use the sample scenario as a reference.** The Martinez family example (`example.json`) shows how a realistic multi-decade scenario is structured, including how to handle overlapping events like college tuition, retirement transitions, and Social Security.

**Disabled models.** Any model can be toggled on or off without deleting it. This is useful for temporarily removing a model to see its isolated impact on the charts.

**Inflation matters over long time horizons.** A 3% annual growth rate on a $10,000 expense means it costs ~$18,000 in 20 years and ~$24,000 in 30 years. Make sure your income growth rates are realistic relative to your expense growth rates.

**The Cumulative Net line is your north star.** It represents your total accumulated financial position over the entire projection. A line that ends positive means you're on track; one that turns negative means your expenses outpace your income at some point and you'll need to make adjustments.

---

## Part 9: Sample Scenario Walkthrough

The Martinez family example (`example.json`) covers the years 2025–2055 with a starting cash balance of $45,000. Here's what's in it:

**Income:**
- Carlos earns $88,000/year (2026–2040, 3% annual raises)
- Sofia earns $62,000/year (2026–2038, 3% annual raises)
- Rental property income of $18,000/year (2026–2055, 2% growth)
- Carlos Social Security of $28,000/year starting 2041 (2.5% COLA)
- Sofia Social Security of $22,000/year starting 2041 (2.5% COLA)

**Expenses:**
- Mortgage payment: $24,000/year fixed through 2051
- Property tax, utilities, household expenses (inflation-linked)
- Childcare: $22,000/year through 2032
- Two college tuition periods (overlapping: 2036–2040 and 2039–2043)
- Rental property expenses
- A car loan (fixed payments through 2030)

**Retirement accounts:**
- Carlos 401(k): $145,000 balance in 2026, contributing through 2040, distributing $55,000/year from 2041 (22% tax rate)
- Sofia Roth IRA: $48,000 balance in 2026, contributing through 2038, distributing $30,000/year from 2041 (0% tax rate — Roth distributions are tax-free)

Load this scenario and follow the Cumulative Net line across 30 years to see how all these elements interact. Notice how the line dips during the college years and climbs again once tuition ends and retirement income begins.