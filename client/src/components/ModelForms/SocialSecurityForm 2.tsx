import { useState } from 'react';
import type { SocialSecurityModel, Defaults } from '../../types/models';

interface Props {
  model: SocialSecurityModel;
  defaults: Defaults;
  onSave: (model: SocialSecurityModel) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export default function SocialSecurityForm({ model, defaults, onSave, onDelete, onCancel }: Props) {
  const [form, setForm] = useState({ ...model });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.annualBenefit || form.annualBenefit <= 0) errs.annualBenefit = 'Must be positive';
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
          <label>Whose benefit?</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label>Estimated annual benefit</label>
          <input type="number" value={form.annualBenefit || ''} onChange={(e) => setForm({ ...form, annualBenefit: Number(e.target.value) })} />
          <div className="form-hint">Check ssa.gov for your estimated benefit</div>
          {errors.annualBenefit && <div className="form-error">{errors.annualBenefit}</div>}
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
          <label>Annual COLA (%)</label>
          <input type="number" step="0.1" value={form.increaseRate} onChange={(e) => setForm({ ...form, increaseRate: Number(e.target.value) })} />
          <div className="form-hint">Default: {defaults.socialSecurityCOLA}%</div>
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
