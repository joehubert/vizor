import { useState } from 'react';
import type { SalaryModel, Defaults, IncreaseType } from '../../types/models';

interface Props {
  model: SalaryModel;
  defaults: Defaults;
  onSave: (model: SalaryModel) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export default function SalaryForm({ model, defaults, onSave, onDelete, onCancel }: Props) {
  const [form, setForm] = useState({ ...model });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          <label>What's this income source?</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label>Annual take-home pay</label>
          <input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
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
          <label>{form.increaseType === 'percent' ? 'Annual raise (%)' : 'Annual raise ($)'}</label>
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
