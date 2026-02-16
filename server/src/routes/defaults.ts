import { Router } from 'express';
import { getDefaults, updateDefaults } from '../data/fileStore.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const defaults = getDefaults();
    res.json(defaults);
  } catch (err) {
    console.error('Failed to read defaults:', err);
    res.status(500).json({ error: 'Failed to read defaults' });
  }
});

router.put('/', (req, res) => {
  try {
    const updated = updateDefaults(req.body);
    res.json(updated);
  } catch (err) {
    console.error('Failed to update defaults:', err);
    res.status(500).json({ error: 'Failed to update defaults' });
  }
});

export default router;
