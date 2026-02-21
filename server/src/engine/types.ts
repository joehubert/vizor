// Vizor — Calculation Output Types

export interface CalculationOutput {
  scenarioName: string;
  years: YearData[];
  accountBalances: AccountBalanceYear[];
}

export interface YearData {
  year: number;
  incomes: LineItem[];
  expenses: LineItem[];
  totalIncome: number;
  totalExpenses: number;
  yearlyNet: number;
  cumulativeNet: number;
  cashOnHand: number;
}

export interface LineItem {
  modelId: string;
  description: string;
  amount: number;
}

export interface AccountBalanceYear {
  modelId: string;
  description: string;
  year: number;
  startingBalance: number;
  contributions: number;
  distributions: number;
  distributionIncome: number;
  growth: number;
  endingBalance: number;
}
