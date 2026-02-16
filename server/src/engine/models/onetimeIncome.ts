import type { OneTimeIncomeModel } from '../../types.js';
import type { LineItem } from '../types.js';

export function calculateOneTimeIncome(
  model: OneTimeIncomeModel,
  year: number,
): LineItem | null {
  if (year !== model.year) {
    return null;
  }
  return {
    modelId: model.id,
    description: model.description,
    amount: model.amount,
  };
}
