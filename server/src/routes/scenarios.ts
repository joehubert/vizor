import { Router } from 'express';
import { getScenario, listScenarios, saveScenario, deleteScenario } from '../data/fileStore.js';
import { calculate } from '../engine/calculator.js';

const router = Router();

// List all scenario names
router.get('/', (_req, res) => {
  try {
    const names = listScenarios();
    res.json(names);
  } catch (err) {
    console.error('Failed to list scenarios:', err);
    res.status(500).json({ error: 'Failed to list scenarios' });
  }
});

// Compare multiple scenarios
router.get('/compare', (req, res) => {
  try {
    const namesParam = req.query.names;
    if (!namesParam || typeof namesParam !== 'string') {
      res.status(400).json({ error: 'names query parameter required' });
      return;
    }
    const names = namesParam.split(',');
    const results = names.map((name) => {
      const scenario = getScenario(name.trim());
      if (!scenario) return null;
      return calculate(scenario);
    }).filter(Boolean);
    res.json(results);
  } catch (err) {
    console.error('Failed to compare scenarios:', err);
    res.status(500).json({ error: 'Failed to compare scenarios' });
  }
});

// Get scenario + calculated output
router.get('/:name', (req, res) => {
  try {
    const scenario = getScenario(req.params.name);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    const calculated = calculate(scenario);
    res.json({ scenario, calculated });
  } catch (err) {
    console.error('Failed to get scenario:', err);
    res.status(500).json({ error: 'Failed to load scenario' });
  }
});

// Create new scenario
router.post('/', (req, res) => {
  try {
    const scenario = req.body;
    saveScenario(scenario);
    const calculated = calculate(scenario);
    res.status(201).json({ scenario, calculated });
  } catch (err) {
    console.error('Failed to create scenario:', err);
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

// Update scenario
router.put('/:name', (req, res) => {
  try {
    const scenario = req.body;
    saveScenario(scenario);
    const calculated = calculate(scenario);
    res.json({ scenario, calculated });
  } catch (err) {
    console.error('Failed to update scenario:', err);
    res.status(500).json({ error: 'Failed to update scenario' });
  }
});

// Delete scenario
router.delete('/:name', (req, res) => {
  try {
    const deleted = deleteScenario(req.params.name);
    if (!deleted) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete scenario:', err);
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
});

// Duplicate scenario
router.post('/:name/duplicate', (req, res) => {
  try {
    const original = getScenario(req.params.name);
    if (!original) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }
    const newName = req.body.name || `${original.name}-copy`;
    const duplicate = { ...original, name: newName, basedOn: original.name };
    saveScenario(duplicate);
    const calculated = calculate(duplicate);
    res.status(201).json({ scenario: duplicate, calculated });
  } catch (err) {
    console.error('Failed to duplicate scenario:', err);
    res.status(500).json({ error: 'Failed to duplicate scenario' });
  }
});

export default router;
