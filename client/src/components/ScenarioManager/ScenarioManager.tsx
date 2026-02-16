import { useState } from 'react';
import './ScenarioManager.css';

interface ScenarioManagerProps {
  scenarios: string[];
  selected: string | null;
  onSwitch: (name: string) => void;
  onCreate: (name: string, description: string, basedOn: string | null) => void;
  onDuplicate: (sourceName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onCompare: (names: string[]) => void;
}

type Dialog = 'create' | 'delete' | 'compare' | null;

export default function ScenarioManager({
  scenarios,
  selected,
  onSwitch,
  onCreate,
  onDuplicate,
  onDelete,
  onCompare,
}: ScenarioManagerProps) {
  const [dialog, setDialog] = useState<Dialog>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [basedOn, setBasedOn] = useState<string>('');

  // Duplicate form state
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [dupName, setDupName] = useState('');

  // Compare form state
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  function resetCreateForm() {
    setNewName('');
    setNewDescription('');
    setBasedOn('');
    setDialog(null);
  }

  function resetDuplicateForm() {
    setDupName('');
    setShowDuplicate(false);
  }

  function resetCompareForm() {
    setCompareSelection([]);
    setDialog(null);
  }

  function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed, newDescription.trim(), basedOn || null);
    resetCreateForm();
  }

  function handleDuplicate() {
    const trimmed = dupName.trim();
    if (!trimmed || !selected) return;
    onDuplicate(selected, trimmed);
    resetDuplicateForm();
  }

  function handleDelete() {
    if (!selected) return;
    onDelete(selected);
    setDialog(null);
  }

  function handleCompare() {
    if (compareSelection.length < 2) return;
    onCompare(compareSelection);
    resetCompareForm();
  }

  function toggleCompareScenario(name: string) {
    setCompareSelection((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      }
      if (prev.length >= 4) return prev;
      return [...prev, name];
    });
  }

  function openDuplicate() {
    if (!selected) return;
    setDupName(`${selected}-copy`);
    setShowDuplicate(true);
  }

  function openCompare() {
    setCompareSelection([]);
    setDialog('compare');
  }

  return (
    <>
      <div className="scenario-controls">
        <select
          className="scenario-picker"
          value={selected ?? ''}
          onChange={(e) => onSwitch(e.target.value)}
        >
          {scenarios.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
          {scenarios.length === 0 && (
            <option value="" disabled>No scenarios</option>
          )}
        </select>

        <button className="sc-btn sc-btn-new" onClick={() => setDialog('create')}>
          New Scenario
        </button>
        <button
          className="sc-btn sc-btn-dup"
          onClick={openDuplicate}
          disabled={!selected}
        >
          Duplicate
        </button>
        <button
          className="sc-btn sc-btn-compare"
          onClick={openCompare}
          disabled={scenarios.length < 2}
        >
          Compare
        </button>
        <button
          className="sc-btn sc-btn-del"
          onClick={() => setDialog('delete')}
          disabled={!selected}
        >
          Delete
        </button>
      </div>

      {/* Create Scenario Dialog */}
      {dialog === 'create' && (
        <div className="sc-overlay" onClick={resetCreateForm}>
          <div className="sc-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>New Scenario</h3>

            <label className="sc-label">
              Name
              <input
                className="sc-input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Early Retirement"
                autoFocus
              />
            </label>

            <label className="sc-label">
              Description
              <input
                className="sc-input"
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional description"
              />
            </label>

            <label className="sc-label">
              Based on
              <select
                className="sc-input"
                value={basedOn}
                onChange={(e) => setBasedOn(e.target.value)}
              >
                <option value="">Empty scenario</option>
                {scenarios.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>

            <div className="sc-actions">
              <button className="sc-btn" onClick={resetCreateForm}>Cancel</button>
              <button
                className="sc-btn sc-btn-primary"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Scenario Dialog */}
      {showDuplicate && (
        <div className="sc-overlay" onClick={resetDuplicateForm}>
          <div className="sc-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Duplicate "{selected}"</h3>

            <label className="sc-label">
              New name
              <input
                className="sc-input"
                type="text"
                value={dupName}
                onChange={(e) => setDupName(e.target.value)}
                autoFocus
              />
            </label>

            <div className="sc-actions">
              <button className="sc-btn" onClick={resetDuplicateForm}>Cancel</button>
              <button
                className="sc-btn sc-btn-primary"
                onClick={handleDuplicate}
                disabled={!dupName.trim()}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Scenario Dialog */}
      {dialog === 'compare' && (
        <div className="sc-overlay" onClick={resetCompareForm}>
          <div className="sc-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Compare Scenarios</h3>
            <p className="sc-confirm-text">
              Select 2 to 4 scenarios to compare side by side.
            </p>

            <div className="sc-compare-list">
              {scenarios.map((name) => (
                <label key={name} className="sc-compare-item">
                  <input
                    type="checkbox"
                    checked={compareSelection.includes(name)}
                    onChange={() => toggleCompareScenario(name)}
                    disabled={!compareSelection.includes(name) && compareSelection.length >= 4}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>

            <div className="sc-actions">
              <button className="sc-btn" onClick={resetCompareForm}>Cancel</button>
              <button
                className="sc-btn sc-btn-primary"
                onClick={handleCompare}
                disabled={compareSelection.length < 2}
              >
                Compare ({compareSelection.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {dialog === 'delete' && selected && (
        <div className="sc-overlay" onClick={() => setDialog(null)}>
          <div className="sc-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Scenario</h3>
            <p className="sc-confirm-text">
              Are you sure you want to delete <strong>"{selected}"</strong>? This cannot be undone.
            </p>
            <div className="sc-actions">
              <button className="sc-btn" onClick={() => setDialog(null)}>Cancel</button>
              <button className="sc-btn sc-btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
