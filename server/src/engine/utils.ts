import type { IncreaseType } from '../types.js';

export function applyIncrease(
  baseAmount: number,
  increaseType: IncreaseType,
  increaseRate: number,
  yearsElapsed: number,
): number {
  if (yearsElapsed === 0) {
    return baseAmount;
  }
  if (increaseType === 'percent') {
    return baseAmount * Math.pow(1 + increaseRate / 100, yearsElapsed);
  }
  // flat
  return baseAmount + increaseRate * yearsElapsed;
}
