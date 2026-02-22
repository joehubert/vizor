import { useState, useMemo } from 'react';
import type { CarLoanModel } from '../../types/models';
import { formatDollars } from '../../utils/format';

interface Props {
  model: CarLoanModel;
  onSave: (model: CarLoanModel) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function calcPayment(loanAmount: number, interestRate: number, termYears: number): { monthly: number; annual: number } | null {
  if (!loanAmount || !interestRate || !termYears || loanAmount <= 0 || interestRate <= 0 || termYears <= 0) return null;
  const monthlyRate = (interestRate / 100) / 12;
  const totalPayments = termYears * 12;
  const monthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
  return { monthly, annual: monthly * 12 };
}

export default function CarLoanForm({ model, onSave, onDelete, onCancel }: Props) {
  const [form, setForm] = useState({ ...model });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const payment = useMemo(
    () => calcPayment(form.loanAmount, form.interestRate, form.termYears),
    [form.loanAmount, form.interestRate, form.termYears],
  );

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.loanAmount || form.loanAmount <= 0) errs.loanAmount = 'Must be positive';
    if (!form.interestRate || form.interestRate <= 0) errs.interestRate = 'Must be positive';
    if (!form.termYears || form.termYears <= 0) errs.termYears = 'Must be positive';
    if (!form.startYear) errs.startYear = 'Required';
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
          <label>Which vehicle?</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label>Loan amount</label>
          <input type="number" value={form.loanAmount || ''} onChange={(e) => setForm({ ...form, loanAmount: Number(e.target.value) })} />
          {errors.loanAmount && <div className="form-error">{errors.loanAmount}</div>}
        </div>
        <div className="form-group">
          <label>Interest rate (%)</label>
          <input type="number" step="0.1" value={form.interestRate || ''} onChange={(e) => setForm({ ...form, interestRate: Number(e.target.value) })} />
          {errors.interestRate && <div className="form-error">{errors.interestRate}</div>}
        </div>
        <div className="form-group">
          <label>Term (years)</label>
          <input type="number" value={form.termYears || ''} onChange={(e) => setForm({ ...form, termYears: Number(e.target.value) })} />
          {errors.termYears && <div className="form-error">{errors.termYears}</div>}
        </div>
        <div className="form-group">
          <label>Start year</label>
          <input type="number" value={form.startYear || ''} onChange={(e) => setForm({ ...form, startYear: Number(e.target.value) })} />
          {errors.startYear && <div className="form-error">{errors.startYear}</div>}
        </div>
        {payment && (
          <div className="computed-display">
            <div><span className="computed-label">Monthly payment: </span><span className="computed-value">{formatDollars(payment.monthly)}</span></div>
            <div><span className="computed-label">Annual payment: </span><span className="computed-value">{formatDollars(payment.annual)}</span></div>
          </div>
        )}
      </div>
      <div className="form-actions">
        {onDelete && <button className="btn-delete" onClick={onDelete}>Delete</button>}
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="btn-save" onClick={handleSave}>Save</button>
      </div>
    </>
  );
}
