import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Scenario, Defaults } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../../data');
const SCENARIOS_DIR = path.join(DATA_DIR, 'scenarios');
const DEFAULTS_PATH = path.join(DATA_DIR, 'defaults.json');

function ensureDirectories(): void {
  if (!fs.existsSync(SCENARIOS_DIR)) {
    fs.mkdirSync(SCENARIOS_DIR, { recursive: true });
  }
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getDefaults(): Defaults {
  const raw = fs.readFileSync(DEFAULTS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function updateDefaults(defaults: Defaults): Defaults {
  fs.writeFileSync(DEFAULTS_PATH, JSON.stringify(defaults, null, 2));
  return defaults;
}

export function listScenarios(): string[] {
  ensureDirectories();
  return fs
    .readdirSync(SCENARIOS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

export function getScenario(name: string): Scenario | null {
  const filePath = path.join(SCENARIOS_DIR, `${slugify(name)}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const scenario = JSON.parse(raw) as Scenario;
  if (scenario.config.startingCashBalance === undefined) {
    scenario.config.startingCashBalance = 0;
  }
  return scenario;
}

export function saveScenario(scenario: Scenario): void {
  ensureDirectories();
  const filePath = path.join(SCENARIOS_DIR, `${slugify(scenario.name)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(scenario, null, 2));
}

export function deleteScenario(name: string): boolean {
  const filePath = path.join(SCENARIOS_DIR, `${slugify(name)}.json`);
  if (!fs.existsSync(filePath)) {
    return false;
  }
  fs.unlinkSync(filePath);
  return true;
}
