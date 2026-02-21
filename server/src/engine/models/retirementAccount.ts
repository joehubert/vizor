import type { RetirementAccountModel } from '../../types.js';
import type { LineItem, AccountBalanceYear } from '../types.js';
import { applyIncrease } from '../utils.js';

export interface RetirementYearResult {
  incomeItem: LineItem | null;
  expenseItem: LineItem | null;
  balanceRecord: AccountBalanceYear;
}

function calculateYearBalance(
  model: RetirementAccountModel,
  year: number,
  startingBalance: number,
): RetirementYearResult {
  let contributionAmount = 0;
  if (
    model.contributions &&
    year >= model.contributions.startYear &&
    year <= model.contributions.endYear
  ) {
    const yearsElapsed = year - model.contributions.startYear;
    contributionAmount = applyIncrease(
      model.contributions.amount,
      model.contributions.increaseType,
      model.contributions.increaseRate,
      yearsElapsed,
    );
  }

  let distributionAmount = 0;
  if (
    model.distributions &&
    year >= model.distributions.startYear &&
    year <= model.distributions.endYear
  ) {
    const yearsElapsed = year - model.distributions.startYear;
    distributionAmount = applyIncrease(
      model.distributions.amount,
      model.distributions.increaseType,
      model.distributions.increaseRate,
      yearsElapsed,
    );
    // Cap distribution at available balance
    const availableForDistribution = startingBalance + contributionAmount;
    if (distributionAmount > availableForDistribution) {
      distributionAmount = Math.max(0, availableForDistribution);
    }
  }

  const balanceAfterFlows = startingBalance + contributionAmount - distributionAmount;
  const growth = balanceAfterFlows * (model.growthRate / 100);
  const endingBalance = balanceAfterFlows + growth;
  const taxRate = model.distributions?.taxRate ?? 0;
  const distributionIncome = distributionAmount * (1 - taxRate / 100);

  const incomeItem: LineItem | null =
    distributionAmount > 0
      ? { modelId: model.id, description: model.description, amount: distributionIncome }
      : null;

  const expenseItem: LineItem | null =
    contributionAmount > 0
      ? { modelId: model.id, description: model.description, amount: contributionAmount }
      : null;

  const balanceRecord: AccountBalanceYear = {
    modelId: model.id,
    description: model.description,
    year,
    startingBalance,
    contributions: contributionAmount,
    distributions: distributionAmount,
    distributionIncome,
    growth,
    endingBalance,
  };

  return { incomeItem, expenseItem, balanceRecord };
}

export interface RetirementAccountOutput {
  /** Indexed by year for quick lookup during scenario calculation */
  yearResults: Map<number, RetirementYearResult>;
}

/**
 * Pre-calculates all years for a retirement account, including any
 * pre-scenario years needed to forward-calculate the balance from
 * balanceAsOfYear to the scenario startYear.
 */
export function calculateRetirementAccount(
  model: RetirementAccountModel,
  scenarioStartYear: number,
  scenarioEndYear: number,
): RetirementAccountOutput {
  const yearResults = new Map<number, RetirementYearResult>();
  const firstYear = Math.min(model.balanceAsOfYear, scenarioStartYear);
  let currentBalance = model.currentBalance;

  for (let year = firstYear; year <= scenarioEndYear; year++) {
    const result = calculateYearBalance(model, year, currentBalance);
    yearResults.set(year, result);
    currentBalance = result.balanceRecord.endingBalance;
  }

  return { yearResults };
}
