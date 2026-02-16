import type { OneTimeExpenseModel } from '../../types.js';
import type { LineItem } from '../types.js';

export function calculateOneTimeExpense(
  model: OneTimeExpenseModel,
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
