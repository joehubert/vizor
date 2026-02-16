import type { Model } from '../../types/models';
import './ModelSidebar.css';

interface Props {
  models: Model[];
  selectedModelId: string | null;
  onSelectModel: (id: string) => void;
  onToggleModel: (id: string, enabled: boolean) => void;
  onAddModel: () => void;
}

interface GroupedModels {
  income: Model[];
  expenses: Model[];
  accounts: Model[];
}

function groupModels(models: Model[]): GroupedModels {
  const groups: GroupedModels = { income: [], expenses: [], accounts: [] };
  for (const m of models) {
    switch (m.type) {
      case 'salary':
      case 'onetime_income':
      case 'social_security':
        groups.income.push(m);
        break;
      case 'recurring_expense':
      case 'onetime_expense':
      case 'mortgage':
      case 'car_loan':
        groups.expenses.push(m);
        break;
      case 'retirement_account':
        groups.accounts.push(m);
        break;
    }
  }
  return groups;
}

function ModelGroup({
  label,
  models,
  selectedModelId,
  onSelectModel,
  onToggleModel,
}: {
  label: string;
  models: Model[];
  selectedModelId: string | null;
  onSelectModel: (id: string) => void;
  onToggleModel: (id: string, enabled: boolean) => void;
}) {
  if (models.length === 0) return null;
  return (
    <div className="model-group">
      <h4 className="model-group-label">{label}</h4>
      {models.map((m) => (
        <div
          key={m.id}
          className={`model-item ${m.id === selectedModelId ? 'selected' : ''} ${!m.enabled ? 'disabled' : ''}`}
        >
          <label className="toggle-wrapper" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={m.enabled}
              onChange={(e) => onToggleModel(m.id, e.target.checked)}
            />
          </label>
          <button
            className="model-item-btn"
            onClick={() => onSelectModel(m.id)}
          >
            <span className="model-item-desc">{m.description || '(untitled)'}</span>
            <span className="model-item-type">{formatType(m.type)}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function formatType(type: string): string {
  return type.replace(/_/g, ' ');
}

export default function ModelSidebar({
  models,
  selectedModelId,
  onSelectModel,
  onToggleModel,
  onAddModel,
}: Props) {
  const groups = groupModels(models);

  return (
    <aside className="model-sidebar">
      <ModelGroup label="Income" models={groups.income} selectedModelId={selectedModelId} onSelectModel={onSelectModel} onToggleModel={onToggleModel} />
      <ModelGroup label="Expenses" models={groups.expenses} selectedModelId={selectedModelId} onSelectModel={onSelectModel} onToggleModel={onToggleModel} />
      <ModelGroup label="Accounts" models={groups.accounts} selectedModelId={selectedModelId} onSelectModel={onSelectModel} onToggleModel={onToggleModel} />

      {models.length === 0 && (
        <div className="sidebar-empty">
          <p>No models yet</p>
          <p className="sidebar-empty-hint">Click "+ Add Model" below to add your first income, expense, or account.</p>
        </div>
      )}

      <button className="add-model-btn" onClick={onAddModel}>
        + Add Model
      </button>
    </aside>
  );
}
