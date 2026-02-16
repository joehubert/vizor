import { describe, it, expect } from 'vitest';
import { calculate } from '../engine/calculator.js';
import type { Scenario, ScenarioConfig, SalaryModel, MortgageModel, RetirementAccountModel, RecurringExpenseModel } from '../types.js';

function makeScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    name: 'test',
    description: '',
    config: { startYear: 2025, endYear: 2030, cpiRate: 3.0, startingCashBalance: 0 },
    basedOn: null,
    models: [],
    ...overrides,
  };
}

describe('Salary with percent increase', () => {
  it('should apply compound percent increase year-over-year', () => {
    const salary: SalaryModel = {
      id: 'sal-1',
      type: 'salary',
      enabled: true,
      description: 'Test Salary',
      amount: 100000,
      startYear: 2025,
      endYear: 2030,
      increaseType: 'percent',
      increaseRate: 5.0,
    };

    const scenario = makeScenario({ models: [salary] });
    const result = calculate(scenario);

    // Year 0 (2025): 100000
    expect(result.years[0].totalIncome).toBeCloseTo(100000, 2);

    // Year 1 (2026): 100000 * 1.05 = 105000
    expect(result.years[1].totalIncome).toBeCloseTo(105000, 2);

    // Year 2 (2027): 100000 * 1.05^2 = 110250
    expect(result.years[2].totalIncome).toBeCloseTo(110250, 2);

    // Year 5 (2030): 100000 * 1.05^5 = 127628.15625
    expect(result.years[5].totalIncome).toBeCloseTo(127628.15625, 2);

    // All should be income line items
    for (const yearData of result.years) {
      expect(yearData.incomes).toHaveLength(1);
      expect(yearData.expenses).toHaveLength(0);
      expect(yearData.incomes[0].modelId).toBe('sal-1');
    }
  });

  it('should apply flat increase year-over-year', () => {
    const salary: SalaryModel = {
      id: 'sal-2',
      type: 'salary',
      enabled: true,
      description: 'Flat Salary',
      amount: 100000,
      startYear: 2025,
      endYear: 2028,
      increaseType: 'flat',
      increaseRate: 3000,
    };

    const scenario = makeScenario({ models: [salary] });
    const result = calculate(scenario);

    expect(result.years[0].totalIncome).toBeCloseTo(100000, 2);
    expect(result.years[1].totalIncome).toBeCloseTo(103000, 2);
    expect(result.years[2].totalIncome).toBeCloseTo(106000, 2);
    expect(result.years[3].totalIncome).toBeCloseTo(109000, 2);
  });

  it('should only produce output within model start/end years', () => {
    const salary: SalaryModel = {
      id: 'sal-3',
      type: 'salary',
      enabled: true,
      description: 'Partial Salary',
      amount: 80000,
      startYear: 2027,
      endYear: 2029,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const scenario = makeScenario({ models: [salary] });
    const result = calculate(scenario);

    // 2025, 2026: no income
    expect(result.years[0].totalIncome).toBe(0);
    expect(result.years[1].totalIncome).toBe(0);

    // 2027-2029: income
    expect(result.years[2].totalIncome).toBeCloseTo(80000, 2);
    expect(result.years[3].totalIncome).toBeCloseTo(80000, 2);
    expect(result.years[4].totalIncome).toBeCloseTo(80000, 2);

    // 2030: no income
    expect(result.years[5].totalIncome).toBe(0);
  });
});

describe('Mortgage payment matching standard amortization', () => {
  it('should calculate correct fixed annual payment for a 30-year mortgage', () => {
    const mortgage: MortgageModel = {
      id: 'mort-1',
      type: 'mortgage',
      enabled: true,
      description: 'Home Mortgage',
      loanAmount: 300000,
      interestRate: 6.0,
      termYears: 30,
      startYear: 2025,
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2060, cpiRate: 3.0, startingCashBalance: 0 },
      models: [mortgage],
    });
    const result = calculate(scenario);

    // Standard amortization: 300k at 6% for 30 years
    // Monthly rate = 0.5%, payments = 360
    // Monthly payment = 300000 * (0.005 * 1.005^360) / (1.005^360 - 1)
    // = 300000 * (0.005 * 6.02258) / (6.02258 - 1)
    // = 300000 * 0.030113 / 5.02258
    // = 300000 * 0.005996
    // = 1798.65 monthly, 21583.80 annually (approx)
    const expectedMonthly = 300000 * (0.005 * Math.pow(1.005, 360)) / (Math.pow(1.005, 360) - 1);
    const expectedAnnual = expectedMonthly * 12;

    // First year
    expect(result.years[0].totalExpenses).toBeCloseTo(expectedAnnual, 2);

    // Should be same payment every year (fixed rate)
    expect(result.years[1].totalExpenses).toBeCloseTo(expectedAnnual, 2);
    expect(result.years[10].totalExpenses).toBeCloseTo(expectedAnnual, 2);

    // Year 30 (index 29, year 2054): last payment year
    expect(result.years[29].totalExpenses).toBeCloseTo(expectedAnnual, 2);

    // Year 31 (index 30, year 2055): no more payments
    expect(result.years[30].totalExpenses).toBe(0);
  });

  it('should handle a 5-year car loan identically', () => {
    const carLoan = {
      id: 'car-1',
      type: 'car_loan' as const,
      enabled: true,
      description: 'Car Loan',
      loanAmount: 30000,
      interestRate: 5.0,
      termYears: 5,
      startYear: 2025,
    };

    const scenario = makeScenario({ models: [carLoan] });
    const result = calculate(scenario);

    const monthlyRate = 0.05 / 12;
    const totalPayments = 60;
    const expectedMonthly = 30000 * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    const expectedAnnual = expectedMonthly * 12;

    // Active for 5 years: 2025-2029
    for (let i = 0; i < 5; i++) {
      expect(result.years[i].totalExpenses).toBeCloseTo(expectedAnnual, 2);
    }

    // 2030: no payment
    expect(result.years[5].totalExpenses).toBe(0);
  });
});

describe('Retirement account with contributions, distributions, and growth', () => {
  it('should track balance with contributions only', () => {
    const retirement: RetirementAccountModel = {
      id: 'ret-1',
      type: 'retirement_account',
      enabled: true,
      description: '401k',
      currentBalance: 100000,
      balanceAsOfYear: 2025,
      growthRate: 10.0,
      contributions: {
        amount: 20000,
        startYear: 2025,
        endYear: 2030,
        increaseType: 'percent',
        increaseRate: 0,
      },
      distributions: null,
    };

    const scenario = makeScenario({ models: [retirement] });
    const result = calculate(scenario);

    // Year 2025: start=100000, contrib=20000, dist=0, balAfterFlows=120000, growth=12000, end=132000
    const bal2025 = result.accountBalances.find((b) => b.year === 2025)!;
    expect(bal2025.startingBalance).toBeCloseTo(100000, 2);
    expect(bal2025.contributions).toBeCloseTo(20000, 2);
    expect(bal2025.distributions).toBeCloseTo(0, 2);
    expect(bal2025.growth).toBeCloseTo(12000, 2);
    expect(bal2025.endingBalance).toBeCloseTo(132000, 2);

    // Year 2026: start=132000, contrib=20000, dist=0, balAfterFlows=152000, growth=15200, end=167200
    const bal2026 = result.accountBalances.find((b) => b.year === 2026)!;
    expect(bal2026.startingBalance).toBeCloseTo(132000, 2);
    expect(bal2026.contributions).toBeCloseTo(20000, 2);
    expect(bal2026.growth).toBeCloseTo(15200, 2);
    expect(bal2026.endingBalance).toBeCloseTo(167200, 2);

    // Contributions should appear as expenses
    expect(result.years[0].expenses).toHaveLength(1);
    expect(result.years[0].expenses[0].amount).toBeCloseTo(20000, 2);
  });

  it('should track balance with distributions only', () => {
    const retirement: RetirementAccountModel = {
      id: 'ret-2',
      type: 'retirement_account',
      enabled: true,
      description: 'Retirement Fund',
      currentBalance: 500000,
      balanceAsOfYear: 2025,
      growthRate: 5.0,
      contributions: null,
      distributions: {
        amount: 40000,
        startYear: 2025,
        endYear: 2030,
        increaseType: 'percent',
        increaseRate: 0,
      },
    };

    const scenario = makeScenario({ models: [retirement] });
    const result = calculate(scenario);

    // Year 2025: start=500000, dist=40000, balAfterFlows=460000, growth=23000, end=483000
    const bal2025 = result.accountBalances.find((b) => b.year === 2025)!;
    expect(bal2025.startingBalance).toBeCloseTo(500000, 2);
    expect(bal2025.distributions).toBeCloseTo(40000, 2);
    expect(bal2025.growth).toBeCloseTo(23000, 2);
    expect(bal2025.endingBalance).toBeCloseTo(483000, 2);

    // Distributions should appear as income
    expect(result.years[0].incomes).toHaveLength(1);
    expect(result.years[0].incomes[0].amount).toBeCloseTo(40000, 2);
  });

  it('should track balance with both contributions and distributions', () => {
    const retirement: RetirementAccountModel = {
      id: 'ret-3',
      type: 'retirement_account',
      enabled: true,
      description: 'Mixed Account',
      currentBalance: 200000,
      balanceAsOfYear: 2025,
      growthRate: 8.0,
      contributions: {
        amount: 10000,
        startYear: 2025,
        endYear: 2027,
        increaseType: 'percent',
        increaseRate: 0,
      },
      distributions: {
        amount: 5000,
        startYear: 2025,
        endYear: 2027,
        increaseType: 'percent',
        increaseRate: 0,
      },
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2027, cpiRate: 3.0, startingCashBalance: 0 },
      models: [retirement],
    });
    const result = calculate(scenario);

    // Year 2025: start=200000, contrib=10000, dist=5000, balAfterFlows=205000, growth=16400, end=221400
    const bal2025 = result.accountBalances.find((b) => b.year === 2025)!;
    expect(bal2025.startingBalance).toBeCloseTo(200000, 2);
    expect(bal2025.contributions).toBeCloseTo(10000, 2);
    expect(bal2025.distributions).toBeCloseTo(5000, 2);
    expect(bal2025.growth).toBeCloseTo(16400, 2);
    expect(bal2025.endingBalance).toBeCloseTo(221400, 2);

    // Both income and expense line items should appear
    expect(result.years[0].incomes).toHaveLength(1);
    expect(result.years[0].expenses).toHaveLength(1);
    expect(result.years[0].incomes[0].amount).toBeCloseTo(5000, 2);
    expect(result.years[0].expenses[0].amount).toBeCloseTo(10000, 2);
  });

  it('should cap distribution at available balance when account is depleted', () => {
    const retirement: RetirementAccountModel = {
      id: 'ret-depleted',
      type: 'retirement_account',
      enabled: true,
      description: 'Small Account',
      currentBalance: 100000,
      balanceAsOfYear: 2025,
      growthRate: 5.0,
      contributions: null,
      distributions: {
        amount: 150000,
        startYear: 2025,
        endYear: 2030,
        increaseType: 'percent',
        increaseRate: 0,
      },
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2028, cpiRate: 3.0, startingCashBalance: 0 },
      models: [retirement],
    });
    const result = calculate(scenario);

    // Year 2025: planned 60000 > available 100000, cap at 100000; account depleted
    const bal2025 = result.accountBalances.find((b) => b.year === 2025)!;
    expect(bal2025.startingBalance).toBeCloseTo(100000, 2);
    expect(bal2025.distributions).toBeCloseTo(100000, 2);
    expect(bal2025.endingBalance).toBeCloseTo(0, 2);

    // Year 2026: balance 0, no funds to distribute
    const bal2026 = result.accountBalances.find((b) => b.year === 2026)!;
    expect(bal2026.startingBalance).toBeCloseTo(0, 2);
    expect(bal2026.distributions).toBeCloseTo(0, 2);
    expect(bal2026.endingBalance).toBeCloseTo(0, 2);

    // Year 2025 income should be capped amount (remaining balance)
    expect(result.years[0].incomes).toHaveLength(1);
    expect(result.years[0].incomes[0].amount).toBeCloseTo(100000, 2);

    // Years 2026+ no distribution income from this account
    expect(result.years[1].incomes).not.toContainEqual(
      expect.objectContaining({ modelId: 'ret-depleted' }),
    );
  });
});

describe('Retirement account with balanceAsOfYear before scenario startYear', () => {
  it('should forward-calculate balance from balanceAsOfYear to scenario start', () => {
    const retirement: RetirementAccountModel = {
      id: 'ret-4',
      type: 'retirement_account',
      enabled: true,
      description: 'Pre-scenario Account',
      currentBalance: 100000,
      balanceAsOfYear: 2020,
      growthRate: 10.0,
      contributions: {
        amount: 10000,
        startYear: 2020,
        endYear: 2030,
        increaseType: 'percent',
        increaseRate: 0,
      },
      distributions: null,
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2027, cpiRate: 3.0, startingCashBalance: 0 },
      models: [retirement],
    });
    const result = calculate(scenario);

    // Manually calculate balances from 2020 to 2024 (pre-scenario years)
    let balance = 100000;
    for (let year = 2020; year < 2025; year++) {
      const afterFlows = balance + 10000;
      const growth = afterFlows * 0.10;
      balance = afterFlows + growth;
    }

    // The starting balance for 2025 in the output should match
    const bal2025 = result.accountBalances.find((b) => b.year === 2025)!;
    expect(bal2025.startingBalance).toBeCloseTo(balance, 2);

    // The output should only have years within the scenario range
    const outputYears = result.years.map((y) => y.year);
    expect(outputYears).toEqual([2025, 2026, 2027]);
  });

  it('should apply contributions during pre-scenario years if schedule overlaps', () => {
    const retirement: RetirementAccountModel = {
      id: 'ret-5',
      type: 'retirement_account',
      enabled: true,
      description: 'Pre-scenario with contrib',
      currentBalance: 50000,
      balanceAsOfYear: 2023,
      growthRate: 5.0,
      contributions: {
        amount: 5000,
        startYear: 2023,
        endYear: 2026,
        increaseType: 'flat',
        increaseRate: 500,
      },
      distributions: null,
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2026, cpiRate: 3.0, startingCashBalance: 0 },
      models: [retirement],
    });
    const result = calculate(scenario);

    // 2023: start=50000, contrib=5000, afterFlows=55000, growth=2750, end=57750
    // 2024: start=57750, contrib=5500 (5000+500*1), afterFlows=63250, growth=3162.50, end=66412.50
    // 2025: start=66412.50, contrib=6000 (5000+500*2), afterFlows=72412.50, growth=3620.625, end=76033.125
    const bal2025 = result.accountBalances.find((b) => b.year === 2025)!;
    expect(bal2025.startingBalance).toBeCloseTo(66412.50, 2);
    expect(bal2025.contributions).toBeCloseTo(6000, 2);
    expect(bal2025.endingBalance).toBeCloseTo(76033.125, 2);
  });
});

describe('Disabled models producing no output', () => {
  it('should not include disabled models in calculation', () => {
    const salary: SalaryModel = {
      id: 'sal-disabled',
      type: 'salary',
      enabled: false,
      description: 'Disabled Salary',
      amount: 100000,
      startYear: 2025,
      endYear: 2030,
      increaseType: 'percent',
      increaseRate: 3.0,
    };

    const expense: RecurringExpenseModel = {
      id: 'exp-enabled',
      type: 'recurring_expense',
      enabled: true,
      description: 'Enabled Expense',
      amount: 20000,
      startYear: 2025,
      endYear: 2030,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const scenario = makeScenario({ models: [salary, expense] });
    const result = calculate(scenario);

    // No income (salary is disabled)
    for (const yearData of result.years) {
      expect(yearData.incomes).toHaveLength(0);
      expect(yearData.totalIncome).toBe(0);
    }

    // Expense should still work
    expect(result.years[0].totalExpenses).toBeCloseTo(20000, 2);
  });

  it('should not include disabled retirement accounts in balances', () => {
    const retirement: RetirementAccountModel = {
      id: 'ret-disabled',
      type: 'retirement_account',
      enabled: false,
      description: 'Disabled 401k',
      currentBalance: 500000,
      balanceAsOfYear: 2025,
      growthRate: 6.0,
      contributions: {
        amount: 20000,
        startYear: 2025,
        endYear: 2030,
        increaseType: 'percent',
        increaseRate: 0,
      },
      distributions: null,
    };

    const scenario = makeScenario({ models: [retirement] });
    const result = calculate(scenario);

    expect(result.accountBalances).toHaveLength(0);
    for (const yearData of result.years) {
      expect(yearData.incomes).toHaveLength(0);
      expect(yearData.expenses).toHaveLength(0);
    }
  });
});

describe('Correct cumulative net calculation', () => {
  it('should accumulate yearly net across years', () => {
    const salary: SalaryModel = {
      id: 'sal-cum',
      type: 'salary',
      enabled: true,
      description: 'Salary',
      amount: 100000,
      startYear: 2025,
      endYear: 2030,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const expense: RecurringExpenseModel = {
      id: 'exp-cum',
      type: 'recurring_expense',
      enabled: true,
      description: 'Expense',
      amount: 60000,
      startYear: 2025,
      endYear: 2030,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const scenario = makeScenario({ models: [salary, expense] });
    const result = calculate(scenario);

    // Each year: net = 100000 - 60000 = 40000
    // Cumulative: 40000, 80000, 120000, 160000, 200000, 240000
    for (let i = 0; i < 6; i++) {
      expect(result.years[i].yearlyNet).toBeCloseTo(40000, 2);
      expect(result.years[i].cumulativeNet).toBeCloseTo(40000 * (i + 1), 2);
    }
  });

  it('should handle negative cumulative net', () => {
    const expense: RecurringExpenseModel = {
      id: 'exp-neg',
      type: 'recurring_expense',
      enabled: true,
      description: 'Big Expense',
      amount: 50000,
      startYear: 2025,
      endYear: 2030,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const scenario = makeScenario({ models: [expense] });
    const result = calculate(scenario);

    for (let i = 0; i < 6; i++) {
      expect(result.years[i].yearlyNet).toBeCloseTo(-50000, 2);
      expect(result.years[i].cumulativeNet).toBeCloseTo(-50000 * (i + 1), 2);
    }
  });

  it('should compute correct totals with mixed model types', () => {
    const salary: SalaryModel = {
      id: 'mix-sal',
      type: 'salary',
      enabled: true,
      description: 'Salary',
      amount: 80000,
      startYear: 2025,
      endYear: 2027,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const expense: RecurringExpenseModel = {
      id: 'mix-exp',
      type: 'recurring_expense',
      enabled: true,
      description: 'Rent',
      amount: 24000,
      startYear: 2025,
      endYear: 2027,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const oneTimeExpense = {
      id: 'mix-ote',
      type: 'onetime_expense' as const,
      enabled: true,
      description: 'Car Purchase',
      amount: 30000,
      year: 2026,
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2027, cpiRate: 3.0, startingCashBalance: 0 },
      models: [salary, expense, oneTimeExpense],
    });
    const result = calculate(scenario);

    // 2025: income=80000, expense=24000, net=56000, cumNet=56000
    expect(result.years[0].totalIncome).toBeCloseTo(80000, 2);
    expect(result.years[0].totalExpenses).toBeCloseTo(24000, 2);
    expect(result.years[0].yearlyNet).toBeCloseTo(56000, 2);
    expect(result.years[0].cumulativeNet).toBeCloseTo(56000, 2);

    // 2026: income=80000, expense=24000+30000=54000, net=26000, cumNet=82000
    expect(result.years[1].totalIncome).toBeCloseTo(80000, 2);
    expect(result.years[1].totalExpenses).toBeCloseTo(54000, 2);
    expect(result.years[1].yearlyNet).toBeCloseTo(26000, 2);
    expect(result.years[1].cumulativeNet).toBeCloseTo(82000, 2);

    // 2027: income=80000, expense=24000, net=56000, cumNet=138000
    expect(result.years[2].totalIncome).toBeCloseTo(80000, 2);
    expect(result.years[2].totalExpenses).toBeCloseTo(24000, 2);
    expect(result.years[2].yearlyNet).toBeCloseTo(56000, 2);
    expect(result.years[2].cumulativeNet).toBeCloseTo(138000, 2);
  });
});

describe('Cash on hand calculation', () => {
  it('should equal cumulativeNet when startingCashBalance is 0', () => {
    const salary: SalaryModel = {
      id: 'coh-sal',
      type: 'salary',
      enabled: true,
      description: 'Salary',
      amount: 100000,
      startYear: 2025,
      endYear: 2027,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2027, cpiRate: 3.0, startingCashBalance: 0 },
      models: [salary],
    });
    const result = calculate(scenario);

    for (const yd of result.years) {
      expect(yd.cashOnHand).toBeCloseTo(yd.cumulativeNet, 2);
    }
  });

  it('should offset by startingCashBalance', () => {
    const salary: SalaryModel = {
      id: 'coh-sal2',
      type: 'salary',
      enabled: true,
      description: 'Salary',
      amount: 80000,
      startYear: 2025,
      endYear: 2027,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const expense: RecurringExpenseModel = {
      id: 'coh-exp',
      type: 'recurring_expense',
      enabled: true,
      description: 'Rent',
      amount: 30000,
      startYear: 2025,
      endYear: 2027,
      increaseType: 'percent',
      increaseRate: 0,
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2027, cpiRate: 3.0, startingCashBalance: 50000 },
      models: [salary, expense],
    });
    const result = calculate(scenario);

    // yearlyNet = 80000 - 30000 = 50000 each year
    // cashOnHand = 50000 + cumulativeNet
    // Year 2025: cashOnHand = 50000 + 50000 = 100000
    expect(result.years[0].cashOnHand).toBeCloseTo(100000, 2);
    // Year 2026: cashOnHand = 50000 + 100000 = 150000
    expect(result.years[1].cashOnHand).toBeCloseTo(150000, 2);
    // Year 2027: cashOnHand = 50000 + 150000 = 200000
    expect(result.years[2].cashOnHand).toBeCloseTo(200000, 2);
  });

  it('should not include retirement account balances in cashOnHand', () => {
    const retirement: RetirementAccountModel = {
      id: 'coh-ret',
      type: 'retirement_account',
      enabled: true,
      description: '401k',
      currentBalance: 100000,
      balanceAsOfYear: 2025,
      growthRate: 10.0,
      contributions: null,
      distributions: null,
    };

    const scenario = makeScenario({
      config: { startYear: 2025, endYear: 2027, cpiRate: 3.0, startingCashBalance: 0 },
      models: [retirement],
    });
    const result = calculate(scenario);

    // No income/expense from retirement (no contributions/distributions)
    // cumulativeNet = 0 each year, cashOnHand = 0 + 0 = 0
    for (const yd of result.years) {
      expect(yd.cashOnHand).toBe(0);
    }

    // But account balances should still be tracked
    expect(result.accountBalances.length).toBeGreaterThan(0);
  });

  it('should default to 0 when startingCashBalance is missing', () => {
    const scenario = {
      name: 'test',
      description: '',
      config: { startYear: 2025, endYear: 2026, cpiRate: 3.0 } as ScenarioConfig,
      basedOn: null,
      models: [],
    };
    const result = calculate(scenario);

    for (const yd of result.years) {
      expect(yd.cashOnHand).toBe(0);
    }
  });
});
