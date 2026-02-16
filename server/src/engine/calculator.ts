import type { Scenario, Model } from '../types.js';
import type { CalculationOutput, YearData, LineItem, AccountBalanceYear } from './types.js';
import { calculateSalary } from './models/salary.js';
import { calculateRecurringExpense } from './models/recurringExpense.js';
import { calculateOneTimeExpense } from './models/onetimeExpense.js';
import { calculateOneTimeIncome } from './models/onetimeIncome.js';
import { calculateMortgage } from './models/mortgage.js';
import { calculateCarLoan } from './models/carLoan.js';
import { calculateRetirementAccount } from './models/retirementAccount.js';
import { calculateSocialSecurity } from './models/socialSecurity.js';

function getModelLineItems(
  model: Model,
  year: number,
): { income: LineItem | null; expense: LineItem | null } {
  switch (model.type) {
    case 'salary': {
      const item = calculateSalary(model, year);
      return { income: item, expense: null };
    }
    case 'recurring_expense': {
      const item = calculateRecurringExpense(model, year);
      return { income: null, expense: item };
    }
    case 'onetime_expense': {
      const item = calculateOneTimeExpense(model, year);
      return { income: null, expense: item };
    }
    case 'onetime_income': {
      const item = calculateOneTimeIncome(model, year);
      return { income: item, expense: null };
    }
    case 'mortgage': {
      const item = calculateMortgage(model, year);
      return { income: null, expense: item };
    }
    case 'car_loan': {
      const item = calculateCarLoan(model, year);
      return { income: null, expense: item };
    }
    case 'social_security': {
      const item = calculateSocialSecurity(model, year);
      return { income: item, expense: null };
    }
    // retirement_account is handled separately
    default:
      return { income: null, expense: null };
  }
}

export function calculate(scenario: Scenario): CalculationOutput {
  const { startYear, endYear } = scenario.config;
  const startingCashBalance = scenario.config.startingCashBalance ?? 0;
  const enabledModels = scenario.models.filter((m) => m.enabled);

  // Pre-calculate retirement accounts (they need sequential balance tracking)
  const retirementModels = enabledModels.filter(
    (m): m is Extract<Model, { type: 'retirement_account' }> =>
      m.type === 'retirement_account',
  );
  const retirementOutputs = retirementModels.map((model) =>
    calculateRetirementAccount(model, startYear, endYear),
  );

  const nonRetirementModels = enabledModels.filter(
    (m) => m.type !== 'retirement_account',
  );

  const years: YearData[] = [];
  const allAccountBalances: AccountBalanceYear[] = [];
  let cumulativeNet = 0;

  for (let year = startYear; year <= endYear; year++) {
    const incomes: LineItem[] = [];
    const expenses: LineItem[] = [];

    // Process non-retirement models
    for (const model of nonRetirementModels) {
      const { income, expense } = getModelLineItems(model, year);
      if (income) incomes.push(income);
      if (expense) expenses.push(expense);
    }

    // Process retirement accounts
    for (let i = 0; i < retirementModels.length; i++) {
      const output = retirementOutputs[i];
      const yearResult = output.yearResults.get(year);
      if (yearResult) {
        if (yearResult.incomeItem) incomes.push(yearResult.incomeItem);
        if (yearResult.expenseItem) expenses.push(yearResult.expenseItem);
        allAccountBalances.push(yearResult.balanceRecord);
      }
    }

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const yearlyNet = totalIncome - totalExpenses;
    cumulativeNet += yearlyNet;

    years.push({
      year,
      incomes,
      expenses,
      totalIncome,
      totalExpenses,
      yearlyNet,
      cumulativeNet,
      cashOnHand: startingCashBalance + cumulativeNet,
    });
  }

  return {
    scenarioName: scenario.name,
    years,
    accountBalances: allAccountBalances,
  };
}
