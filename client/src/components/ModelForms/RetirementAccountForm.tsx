import { useState } from 'react';
import type { RetirementAccountModel, Schedule, Defaults, IncreaseType } from '../../types/models';

interface Props {
  model: RetirementAccountModel;
  defaults: Defaults;
  scenarioEndYear: number;
  onSave: (model: RetirementAccountModel) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const currentYear = new Date().getFullYear();

const EMPTY_CONTRIBUTIONS: Schedule = {
  amount: 0,
  startYear: currentYear,
  endYear: currentYear + 20,
  increaseType: 'percent',
  increaseRate: 0,
};

function emptyDistributions(endYear: number, cpiRate: number): Schedule {
  return {
    amount: 0,
    startYear: currentYear + 20,
    endYear,
    increaseType: 'percent',
    increaseRate: cpiRate,
  };
}

export default function RetirementAccountForm({ model, defaults, scenarioEndYear, onSave, onDelete, onCancel }: Props) {
  const [form, setForm] = useState({ ...model });
  const [showContrib, setShowContrib] = useState(model.contributions !== null);
  const [showDistrib, setShowDistrib] = useState(model.distributions !== null);
  const [contrib, setContrib] = useState<Schedule>(model.contributions ?? { ...EMPTY_CONTRIBUTIONS });
  const [distrib, setDistrib] = useState<Schedule>(model.distributions ?? emptyDistributions(scenarioEndYear, defaults.cpiRate));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (form.currentBalance === undefined || form.currentBalance === null) errs.currentBalance = 'Required';
    if (!form.balanceAsOfYear) errs.balanceAsOfYear = 'Required';
    if (form.growthRate === undefined || form.growthRate === null) errs.growthRate = 'Required';
    if (showContrib) {
      if (contrib.amount !== 0 && (!contrib.amount || contrib.amount <= 0)) errs.contribAmount = 'Must be positive';
      if (!contrib.startYear) errs.contribStartYear = 'Required';
      if (!contrib.endYear) errs.contribEndYear = 'Required';
      if (contrib.endYear < contrib.startYear) errs.contribEndYear = 'Must be after start year';
    }
    if (showDistrib) {
      if (distrib.amount !== 0 && (!distrib.amount || distrib.amount <= 0)) errs.distribAmount = 'Must be positive';
      if (!distrib.startYear) errs.distribStartYear = 'Required';
      if (!distrib.endYear) errs.distribEndYear = 'Required';
      if (distrib.endYear < distrib.startYear) errs.distribEndYear = 'Must be after start year';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      ...form,
      contributions: showContrib && contrib.amount > 0 ? contrib : null,
      distributions: showDistrib && distrib.amount > 0 ? distrib : null,
    });
  }

  return (
    <>
      <div className="form-body">
        <div className="form-group">
          <label>Which account?</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label>Current balance</label>
          <input type="number" value={form.currentBalance || ''} onChange={(e) => setForm({ ...form, currentBalance: Number(e.target.value) })} />
          {errors.currentBalance && <div className="form-error">{errors.currentBalance}</div>}
        </div>
        <div className="form-group">
          <label>Balance as of year</label>
          <input type="number" value={form.balanceAsOfYear || ''} onChange={(e) => setForm({ ...form, balanceAsOfYear: Number(e.target.value) })} />
          {errors.balanceAsOfYear && <div className="form-error">{errors.balanceAsOfYear}</div>}
        </div>
        <div className="form-group">
          <label>Expected annual return (%)</label>
          <input type="number" step="0.1" value={form.growthRate} onChange={(e) => setForm({ ...form, growthRate: Number(e.target.value) })} />
          <div className="form-hint">Default: {defaults.retirementGrowthRate}%</div>
          {errors.growthRate && <div className="form-error">{errors.growthRate}</div>}
        </div>

        {/* Contributions */}
        <div className="form-section-label-row">
          <div
            className="form-section-label"
            onClick={() => setShowContrib(!showContrib)}
          >
            {showContrib ? '▾' : '▸'} Contributions
          </div>
          {showContrib && (
            <button
              type="button"
              className="btn-clear-link"
              onClick={() => setContrib({ ...EMPTY_CONTRIBUTIONS })}
            >
              Clear
            </button>
          )}
        </div>
        {showContrib && (
          <>
            <div className="form-group">
              <label>Annual contribution</label>
              <input type="number" value={contrib.amount || ''} onChange={(e) => setContrib({ ...contrib, amount: Number(e.target.value) })} />
              {errors.contribAmount && <div className="form-error">{errors.contribAmount}</div>}
            </div>
            <div className="form-group">
              <label>Contributions start year</label>
              <input type="number" value={contrib.startYear || ''} onChange={(e) => setContrib({ ...contrib, startYear: Number(e.target.value) })} />
              {errors.contribStartYear && <div className="form-error">{errors.contribStartYear}</div>}
            </div>
            <div className="form-group">
              <label>Contributions end year</label>
              <input type="number" value={contrib.endYear || ''} onChange={(e) => setContrib({ ...contrib, endYear: Number(e.target.value) })} />
              {errors.contribEndYear && <div className="form-error">{errors.contribEndYear}</div>}
            </div>
            <div className="form-group">
              <label>How do contributions grow?</label>
              <select value={contrib.increaseType} onChange={(e) => setContrib({ ...contrib, increaseType: e.target.value as IncreaseType })}>
                <option value="percent">Percent</option>
                <option value="flat">Flat amount</option>
              </select>
            </div>
            <div className="form-group">
              <label>Annual increase</label>
              <input type="number" step="0.1" value={contrib.increaseRate} onChange={(e) => setContrib({ ...contrib, increaseRate: Number(e.target.value) })} />
            </div>
          </>
        )}

        {/* Distributions */}
        <div className="form-section-label-row">
          <div
            className="form-section-label"
            onClick={() => setShowDistrib(!showDistrib)}
          >
            {showDistrib ? '▾' : '▸'} Distributions
          </div>
          {showDistrib && (
            <button
              type="button"
              className="btn-clear-link"
              onClick={() => setDistrib(emptyDistributions(scenarioEndYear, defaults.cpiRate))}
            >
              Clear
            </button>
          )}
        </div>
        {showDistrib && (
          <>
            <div className="form-group">
              <label>Annual withdrawal</label>
              <input type="number" value={distrib.amount || ''} onChange={(e) => setDistrib({ ...distrib, amount: Number(e.target.value) })} />
              {errors.distribAmount && <div className="form-error">{errors.distribAmount}</div>}
            </div>
            <div className="form-group">
              <label>Withdrawals start year</label>
              <input type="number" value={distrib.startYear || ''} onChange={(e) => setDistrib({ ...distrib, startYear: Number(e.target.value) })} />
              {errors.distribStartYear && <div className="form-error">{errors.distribStartYear}</div>}
            </div>
            <div className="form-group">
              <label>Withdrawals end year</label>
              <input type="number" value={distrib.endYear || ''} onChange={(e) => setDistrib({ ...distrib, endYear: Number(e.target.value) })} />
              {errors.distribEndYear && <div className="form-error">{errors.distribEndYear}</div>}
            </div>
            <div className="form-group">
              <label>How do withdrawals grow?</label>
              <select value={distrib.increaseType} onChange={(e) => setDistrib({ ...distrib, increaseType: e.target.value as IncreaseType })}>
                <option value="percent">Percent</option>
                <option value="flat">Flat amount</option>
              </select>
            </div>
            <div className="form-group">
              <label>Annual increase</label>
              <input type="number" step="0.1" value={distrib.increaseRate} onChange={(e) => setDistrib({ ...distrib, increaseRate: Number(e.target.value) })} />
              <div className="form-hint">Default CPI: {defaults.cpiRate}%</div>
            </div>
          </>
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
