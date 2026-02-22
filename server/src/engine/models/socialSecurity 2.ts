import type { SocialSecurityModel } from '../../types.js';
import type { LineItem } from '../types.js';

export function calculateSocialSecurity(
  model: SocialSecurityModel,
  year: number,
): LineItem | null {
  if (year < model.startYear || year > model.endYear) {
    return null;
  }
  const yearsElapsed = year - model.startYear;
  const amount = model.annualBenefit * Math.pow(1 + model.increaseRate / 100, yearsElapsed);
  return {
    modelId: model.id,
    description: model.description,
    amount,
  };
}
