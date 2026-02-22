import type { CarLoanModel } from '../../types.js';
import type { LineItem } from '../types.js';

export function calculateCarLoanPayment(model: CarLoanModel): number {
  const monthlyRate = (model.interestRate / 100) / 12;
  const totalPayments = model.termYears * 12;
  const monthlyPayment =
    model.loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  return monthlyPayment * 12;
}

export function calculateCarLoan(
  model: CarLoanModel,
  year: number,
): LineItem | null {
  if (year < model.startYear || year >= model.startYear + model.termYears) {
    return null;
  }
  const annualPayment = calculateCarLoanPayment(model);
  return {
    modelId: model.id,
    description: model.description,
    amount: annualPayment,
  };
}
