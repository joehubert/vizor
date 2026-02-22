import type { RecurringExpenseModel } from '../../types.js';
import type { LineItem } from '../types.js';
import { applyIncrease } from '../utils.js';

export function calculateRecurringExpense(
  model: RecurringExpenseModel,
  year: number,
): LineItem | null {
  if (year < model.startYear || year > model.endYear) {
    return null;
  }
  const yearsElapsed = year - model.startYear;
  const amount = applyIncrease(model.amount, model.increaseType, model.increaseRate, yearsElapsed);
  return {
    modelId: model.id,
    description: model.description,
    amount,
  };
}
