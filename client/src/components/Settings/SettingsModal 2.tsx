import { useState } from 'react';
import type { Defaults } from '../../types/models';
import './SettingsModal.css';

interface Props {
  defaults: Defaults;
  onSave: (defaults: Defaults) => void;
  onClose: () => void;
}

export default function SettingsModal({ defaults, onSave, onClose }: Props) {
  const [form, setForm] = useState<Defaults>({
    ...defaults,
    typicalCosts: { ...defaults.typicalCosts },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof Omit<Defaults, 'typicalCosts'>, value: number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setCost(field: keyof Defaults['typicalCosts'], value: number) {
    setForm((prev) => ({
      ...prev,
      typicalCosts: { ...prev.typicalCosts, [field]: value },
    }));
  }

  function handleSave() {
    setSaving(true);
    setError(null);
    fetch('/api/defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to save defaults');
        return r.json();
      })
      .then((updated: Defaults) => {
        onSave(updated);
        onClose();
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Settings</h3>

        {error && <p className="settings-error">{error}</p>}

        <div className="form-group">
          <label>CPI Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={form.cpiRate}
            onChange={(e) => setField('cpiRate', Number(e.target.value))}
          />
          <p className="form-hint">Default annual increase rate for new income and expense models</p>
        </div>

        <div className="form-group">
          <label>Estimated Tax Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={form.estimatedTaxRate}
            onChange={(e) => setField('estimatedTaxRate', Number(e.target.value))}
          />
          <p className="form-hint">Reference tax rate for planning purposes</p>
        </div>

        <div className="form-group">
          <label>Retirement Growth Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={form.retirementGrowthRate}
            onChange={(e) => setField('retirementGrowthRate', Number(e.target.value))}
          />
          <p className="form-hint">Default expected annual return for retirement accounts</p>
        </div>

        <div className="form-group">
          <label>Social Security COLA (%)</label>
          <input
            type="number"
            step="0.1"
            value={form.socialSecurityCOLA}
            onChange={(e) => setField('socialSecurityCOLA', Number(e.target.value))}
          />
          <p className="form-hint">Default annual cost-of-living adjustment for Social Security</p>
        </div>

        <h4 className="settings-section-label">Typical Annual Costs</h4>
        <p className="form-hint">Reference values shown as hints when creating expense models</p>

        <div className="form-group">
          <label>Utilities</label>
          <input
            type="number"
            value={form.typicalCosts.utilities}
            onChange={(e) => setCost('utilities', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Household Expenses</label>
          <input
            type="number"
            value={form.typicalCosts.householdExpenses}
            onChange={(e) => setCost('householdExpenses', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Auto Insurance</label>
          <input
            type="number"
            value={form.typicalCosts.autoInsurance}
            onChange={(e) => setCost('autoInsurance', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Health Insurance</label>
          <input
            type="number"
            value={form.typicalCosts.healthInsurance}
            onChange={(e) => setCost('healthInsurance', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Homeowners Insurance</label>
          <input
            type="number"
            value={form.typicalCosts.homeownersInsurance}
            onChange={(e) => setCost('homeownersInsurance', Number(e.target.value))}
          />
        </div>

        <div className="settings-actions">
          <button className="sc-btn" onClick={onClose}>Cancel</button>
          <button className="sc-btn sc-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
