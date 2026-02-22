export type ModelType =
  | 'salary'
  | 'recurring_expense'
  | 'onetime_expense'
  | 'onetime_income'
  | 'mortgage'
  | 'car_loan'
  | 'retirement_account'
  | 'social_security';

export type IncreaseType = 'percent' | 'flat';

export interface ModelBase {
  id: string;
  type: ModelType;
  enabled: boolean;
  description: string;
}

export interface SalaryModel extends ModelBase {
  type: 'salary';
  amount: number;
  startYear: number;
  endYear: number;
  increaseType: IncreaseType;
  increaseRate: number;
}

export interface RecurringExpenseModel extends ModelBase {
  type: 'recurring_expense';
  amount: number;
  startYear: number;
  endYear: number;
  increaseType: IncreaseType;
  increaseRate: number;
}

export interface OneTimeExpenseModel extends ModelBase {
  type: 'onetime_expense';
  amount: number;
  year: number;
}

export interface OneTimeIncomeModel extends ModelBase {
  type: 'onetime_income';
  amount: number;
  year: number;
}

export interface MortgageModel extends ModelBase {
  type: 'mortgage';
  loanAmount: number;
  interestRate: number;
  termYears: number;
  startYear: number;
}

export interface CarLoanModel extends ModelBase {
  type: 'car_loan';
  loanAmount: number;
  interestRate: number;
  termYears: number;
  startYear: number;
}

export interface Schedule {
  amount: number;
  startYear: number;
  endYear: number;
  increaseType: IncreaseType;
  increaseRate: number;
  taxRate?: number;
}

export interface RetirementAccountModel extends ModelBase {
  type: 'retirement_account';
  currentBalance: number;
  balanceAsOfYear: number;
  growthRate: number;
  contributions: Schedule | null;
  distributions: Schedule | null;
}

export interface SocialSecurityModel extends ModelBase {
  type: 'social_security';
  annualBenefit: number;
  startYear: number;
  endYear: number;
  increaseRate: number;
}

export type Model =
  | SalaryModel
  | RecurringExpenseModel
  | OneTimeExpenseModel
  | OneTimeIncomeModel
  | MortgageModel
  | CarLoanModel
  | RetirementAccountModel
  | SocialSecurityModel;

export interface ScenarioConfig {
  startYear: number;
  endYear: number;
  cpiRate: number;
  startingCashBalance: number;
}

export interface Scenario {
  name: string;
  description: string;
  config: ScenarioConfig;
  basedOn: string | null;
  models: Model[];
}

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

export interface Defaults {
  cpiRate: number;
  estimatedTaxRate: number;
  typicalCosts: {
    utilities: number;
    householdExpenses: number;
    autoInsurance: number;
    healthInsurance: number;
    homeownersInsurance: number;
  };
  retirementGrowthRate: number;
  socialSecurityCOLA: number;
}

export interface ScenarioResponse {
  scenario: Scenario;
  calculated: CalculationOutput;
}
