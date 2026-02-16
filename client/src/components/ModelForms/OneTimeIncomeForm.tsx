import { useState } from 'react';
import type { OneTimeIncomeModel } from '../../types/models';

interface Props {
  model: OneTimeIncomeModel;
  onSave: (model: OneTimeIncomeModel) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export default function OneTimeIncomeForm({ model, onSave, onDelete, onCancel }: Props) {
  const [form, setForm] = useState({ ...model });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.amount || form.amount <= 0) errs.amount = 'Must be positive';
    if (!form.year) errs.year = 'Required';
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
          <label>What's this income?</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label>Amount (net)</label>
          <input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          {errors.amount && <div className="form-error">{errors.amount}</div>}
        </div>
        <div className="form-group">
          <label>Year</label>
          <input type="number" value={form.year || ''} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          {errors.year && <div className="form-error">{errors.year}</div>}
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
