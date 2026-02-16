import { useState, useEffect, useCallback } from 'react';
import type { ScenarioResponse, ScenarioConfig, Defaults, Model, ModelType, Scenario, CalculationOutput } from './types/models';
import OverviewLineChart from './components/Charts/OverviewLineChart';
import StackedBarChart from './components/Charts/StackedBarChart';
import DataTable from './components/DataTable/DataTable';
import ModelSidebar from './components/Dashboard/ModelSidebar';
import ModelFormPanel from './components/ModelForms/ModelFormPanel';
import TemplatePicker from './components/ModelForms/TemplatePicker';
import ScenarioManager from './components/ScenarioManager/ScenarioManager';
import ScenarioCompareView from './components/ScenarioManager/ScenarioCompareView';
import SettingsModal from './components/Settings/SettingsModal';
import './App.css';

const currentYear = new Date().getFullYear();

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function createNewModel(type: ModelType, defaults: Defaults, scenarioEndYear: number): Model {
  const id = crypto.randomUUID();
  const base = { id, enabled: true, description: '' };

  switch (type) {
    case 'salary':
      return { ...base, type, amount: 0, startYear: currentYear, endYear: scenarioEndYear, increaseType: 'percent', increaseRate: defaults.cpiRate };
    case 'recurring_expense':
      return { ...base, type, amount: 0, startYear: currentYear, endYear: scenarioEndYear, increaseType: 'percent', increaseRate: defaults.cpiRate };
    case 'onetime_expense':
      return { ...base, type, amount: 0, year: currentYear };
    case 'onetime_income':
      return { ...base, type, amount: 0, year: currentYear };
    case 'mortgage':
      return { ...base, type, loanAmount: 0, interestRate: 0, termYears: 30, startYear: currentYear };
    case 'car_loan':
      return { ...base, type, loanAmount: 0, interestRate: 0, termYears: 5, startYear: currentYear };
    case 'retirement_account':
      return { ...base, type, currentBalance: 0, balanceAsOfYear: currentYear, growthRate: defaults.retirementGrowthRate, contributions: null, distributions: null };
    case 'social_security':
      return { ...base, type, annualBenefit: 0, startYear: currentYear, endYear: scenarioEndYear, increaseRate: defaults.socialSecurityCOLA };
  }
}

function App() {
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ScenarioResponse | null>(null);
  const [defaults, setDefaults] = useState<Defaults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [newModel, setNewModel] = useState<Model | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // View state
  const [activeView, setActiveView] = useState<'charts' | 'table'>('charts');

  // Compare state
  const [compareResults, setCompareResults] = useState<CalculationOutput[] | null>(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);

  // Load scenarios and defaults on mount
  useEffect(() => {
    Promise.all([
      fetchJSON<string[]>('/api/scenarios'),
      fetchJSON<Defaults>('/api/defaults'),
    ])
      .then(([names, defs]) => {
        setScenarios(names);
        setDefaults(defs);
        if (names.length > 0) setSelected(names[0]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Refresh the scenario list from the server
  function refreshScenarios(): Promise<string[]> {
    return fetchJSON<string[]>('/api/scenarios')
      .then((names) => {
        setScenarios(names);
        return names;
      });
  }

  // Load scenario detail when selection changes
  const loadScenario = useCallback((name: string) => {
    fetchJSON<ScenarioResponse>(`/api/scenarios/${name}`)
      .then((data) => setDetail(data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selected) loadScenario(selected);
    else setDetail(null);
  }, [selected, loadScenario]);

  // Save updated scenario to server and refresh
  function saveScenario(updatedModels: Model[]) {
    if (!detail || !selected) return;
    setSaving(true);
    const updatedScenario = { ...detail.scenario, models: updatedModels };
    fetchJSON<ScenarioResponse>(`/api/scenarios/${selected}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedScenario),
    })
      .then((data) => {
        setDetail(data);
        setEditingModelId(null);
        setNewModel(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  // Save updated scenario config to server and refresh
  function saveConfig(updatedConfig: ScenarioConfig) {
    if (!detail || !selected) return;
    setSaving(true);
    const updatedScenario = { ...detail.scenario, config: updatedConfig };
    fetchJSON<ScenarioResponse>(`/api/scenarios/${selected}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedScenario),
    })
      .then((data) => setDetail(data))
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }

  // Toggle model enabled/disabled
  function handleToggleModel(id: string, enabled: boolean) {
    if (!detail) return;
    const updatedModels = detail.scenario.models.map((m) =>
      m.id === id ? { ...m, enabled } : m,
    );
    saveScenario(updatedModels);
  }

  // Save edited or new model
  function handleSaveModel(model: Model) {
    if (!detail) return;
    const existing = detail.scenario.models.find((m) => m.id === model.id);
    let updatedModels: Model[];
    if (existing) {
      updatedModels = detail.scenario.models.map((m) => (m.id === model.id ? model : m));
    } else {
      updatedModels = [...detail.scenario.models, model];
    }
    saveScenario(updatedModels);
  }

  // Delete model
  function handleDeleteModel() {
    if (!detail || !editingModelId) return;
    const updatedModels = detail.scenario.models.filter((m) => m.id !== editingModelId);
    saveScenario(updatedModels);
  }

  // Scenario management: switch
  function handleScenarioSwitch(name: string) {
    setSelected(name);
    setEditingModelId(null);
    setNewModel(null);
  }

  // Scenario management: create
  function handleCreateScenario(name: string, description: string, basedOn: string | null) {
    setSaving(true);
    let newScenario: Scenario;
    if (basedOn) {
      fetchJSON<ScenarioResponse>(`/api/scenarios/${basedOn}`)
        .then((data) => {
          newScenario = {
            name,
            description,
            config: { ...data.scenario.config },
            basedOn,
            models: data.scenario.models.map((m) => ({ ...m, id: crypto.randomUUID() })),
          };
          return fetchJSON('/api/scenarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newScenario),
          });
        })
        .then(() => refreshScenarios().then(() => setSelected(name)))
        .catch((err) => setError(err.message))
        .finally(() => setSaving(false));
    } else {
      newScenario = {
        name,
        description,
        config: { startYear: currentYear, endYear: currentYear + 30, cpiRate: defaults?.cpiRate ?? 3, startingCashBalance: 0 },
        basedOn: null,
        models: [],
      };
      fetchJSON('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScenario),
      })
        .then(() => refreshScenarios().then(() => setSelected(name)))
        .catch((err) => setError(err.message))
        .finally(() => setSaving(false));
    }
    setEditingModelId(null);
    setNewModel(null);
  }

  // Scenario management: duplicate
  function handleDuplicateScenario(sourceName: string, newName: string) {
    setSaving(true);
    fetchJSON(`/api/scenarios/${sourceName}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
      .then(() => refreshScenarios().then(() => setSelected(newName)))
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
    setEditingModelId(null);
    setNewModel(null);
  }

  // Scenario management: delete
  function handleDeleteScenario(name: string) {
    setSaving(true);
    fetchJSON(`/api/scenarios/${name}`, { method: 'DELETE' })
      .then(() =>
        refreshScenarios().then((names) => {
          if (names.length > 0) {
            setSelected(names[0]);
          } else {
            setSelected(null);
            setDetail(null);
          }
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
    setEditingModelId(null);
    setNewModel(null);
  }

  // Scenario management: compare
  function handleCompare(names: string[]) {
    fetchJSON<CalculationOutput[]>(`/api/scenarios/compare?names=${names.map(encodeURIComponent).join(',')}`)
      .then((data) => {
        setCompareResults(data);
        setEditingModelId(null);
        setNewModel(null);
      })
      .catch((err) => setError(err.message));
  }

  function handleCloseCompare() {
    setCompareResults(null);
  }

  // Template picker selected
  function handleTemplateSelect(type: ModelType) {
    if (!defaults || !detail) return;
    const model = createNewModel(type, defaults, detail.scenario.config.endYear);
    setNewModel(model);
    setShowTemplatePicker(false);
    setEditingModelId(null);
  }

  // Which model is being edited (existing or new)
  const editingModel = newModel
    ?? detail?.scenario.models.find((m) => m.id === editingModelId)
    ?? null;

  return (
    <div className="app-layout">
      <header className="top-bar">
        <div className="top-bar-left">
          <h1>Vizor</h1>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            &#9881;
          </button>
          {saving && <span className="saving-indicator">Saving...</span>}
        </div>
        <ScenarioManager
          scenarios={scenarios}
          selected={selected}
          onSwitch={handleScenarioSwitch}
          onCreate={handleCreateScenario}
          onDuplicate={handleDuplicateScenario}
          onDelete={handleDeleteScenario}
          onCompare={handleCompare}
        />
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading your data...</p>
        </div>
      )}

      {!loading && compareResults && (
        <div className="content-area">
          <ScenarioCompareView results={compareResults} onClose={handleCloseCompare} />
        </div>
      )}

      {!loading && !compareResults && detail && defaults && (
        <div className="main-content">
          <ModelSidebar
            models={detail.scenario.models}
            selectedModelId={editingModelId}
            onSelectModel={(id) => {
              setEditingModelId(id);
              setNewModel(null);
            }}
            onToggleModel={handleToggleModel}
            onAddModel={() => setShowTemplatePicker(true)}
          />

          <div className="content-area">
            <div className="view-toggle">
              <button
                className={activeView === 'charts' ? 'active' : ''}
                onClick={() => setActiveView('charts')}
              >
                Charts
              </button>
              <button
                className={activeView === 'table' ? 'active' : ''}
                onClick={() => setActiveView('table')}
              >
                Table
              </button>
            </div>

            <div className="scenario-config-bar">
              <label className="config-field">
                <span>Starting Cash Balance ($)</span>
                <input
                  type="number"
                  defaultValue={detail.scenario.config.startingCashBalance ?? 0}
                  key={`${selected}-cash`}
                  onBlur={(e) => {
                    const value = Number(e.target.value) || 0;
                    if (value !== (detail.scenario.config.startingCashBalance ?? 0)) {
                      saveConfig({ ...detail.scenario.config, startingCashBalance: value });
                    }
                  }}
                />
              </label>
            </div>

            {activeView === 'charts' && (
              <div className="chart-container">
                <section className="chart-section">
                  <h2>Income, Expenses & Net</h2>
                  <OverviewLineChart years={detail.calculated.years} />
                </section>
                <section className="chart-section">
                  <h2>Income & Expense Breakdown</h2>
                  <StackedBarChart years={detail.calculated.years} />
                </section>
              </div>
            )}

            {activeView === 'table' && (
              <DataTable
                years={detail.calculated.years}
                scenarioName={detail.scenario.name}
              />
            )}
          </div>

          {editingModel && (
            <ModelFormPanel
              key={editingModel.id}
              model={editingModel}
              defaults={defaults}
              scenarioEndYear={detail.scenario.config.endYear}
              isNew={newModel !== null}
              onSave={handleSaveModel}
              onDelete={handleDeleteModel}
              onCancel={() => {
                setEditingModelId(null);
                setNewModel(null);
              }}
            />
          )}
        </div>
      )}

      {!loading && !compareResults && !detail && defaults && (
        <div className="empty-state">
          <div className="empty-state-content">
            <h2>Welcome to Vizor</h2>
            <p>
              Vizor helps you project your personal finances over time.
              Create income, expense, and account models to see how your
              financial picture evolves year by year.
            </p>
            <p className="empty-state-hint">
              Click <strong>New Scenario</strong> in the top bar to get started.
            </p>
          </div>
        </div>
      )}

      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {showSettings && defaults && (
        <SettingsModal
          defaults={defaults}
          onSave={(updated) => setDefaults(updated)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
