import { useState } from 'react';
import type { RecurringExpenseModel, Defaults, IncreaseType } from '../../types/models';

interface Props {
  model: RecurringExpenseModel;
  defaults: Defaults;
  onSave: (model: RecurringExpenseModel) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function getHint(description: string, defaults: Defaults): string | null {
  const lower = description.toLowerCase();
  if (lower.includes('utilit')) return `Typical US household: ~$${defaults.typicalCosts.utilities.toLocaleString()}/year`;
  if (lower.includes('household')) return `Typical US household: ~$${defaults.typicalCosts.householdExpenses.toLocaleString()}/year`;
  if (lower.includes('auto') && lower.includes('insur')) return `Typical: ~$${defaults.typicalCosts.autoInsurance.toLocaleString()}/year`;
  if (lower.includes('health') && lower.includes('insur')) return `Typical: ~$${defaults.typicalCosts.healthInsurance.toLocaleString()}/year`;
  if (lower.includes('homeowner') && lower.includes('insur')) return `Typical: ~$${defaults.typicalCosts.homeownersInsurance.toLocaleString()}/year`;
  return null;
}

export default function RecurringExpenseForm({ model, defaults, onSave, onDelete, onCancel }: Props) {
  const [form, setForm] = useState({ ...model });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hint = getHint(form.description, defaults);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.amount || form.amount <= 0) errs.amount = 'Must be positive';
    if (!form.startYear) errs.startYear = 'Required';
    if (!form.endYear) errs.endYear = 'Required';
    if (form.endYear < form.startYear) errs.endYear = 'Must be after start year';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (validate()) onSave(form);
  }

  return (
    <>
      <div className="form-body">
        <div className="form-group">
          <label>What's this expense?</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label>Annual amount</label>
          <input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          {hint && <div className="form-hint">{hint}</div>}
          {errors.amount && <div className="form-error">{errors.amount}</div>}
        </div>
        <div className="form-group">
          <label>Start year</label>
          <input type="number" value={form.startYear || ''} onChange={(e) => setForm({ ...form, startYear: Number(e.target.value) })} />
          {errors.startYear && <div className="form-error">{errors.startYear}</div>}
        </div>
        <div className="form-group">
          <label>End year</label>
          <input type="number" value={form.endYear || ''} onChange={(e) => setForm({ ...form, endYear: Number(e.target.value) })} />
          {errors.endYear && <div className="form-error">{errors.endYear}</div>}
        </div>
        <div className="form-group">
          <label>How does it grow?</label>
          <select value={form.increaseType} onChange={(e) => setForm({ ...form, increaseType: e.target.value as IncreaseType })}>
            <option value="percent">Percent</option>
            <option value="flat">Flat amount</option>
          </select>
        </div>
        <div className="form-group">
          <label>{form.increaseType === 'percent' ? 'Annual increase (%)' : 'Annual increase ($)'}</label>
          <input type="number" step="0.1" value={form.increaseRate} onChange={(e) => setForm({ ...form, increaseRate: Number(e.target.value) })} />
          <div className="form-hint">Default CPI: {defaults.cpiRate}%</div>
        </div>
      </div>
      <div className="form-actions">
        {onDelete && <button className="btn-delete" onClick={onDelete}>Delete</button>}
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="btn-save" onClick={handleSave}>Save</button>
      </div>
    </>
  );
}
