# Vizor — Architecture

## Overview

Vizor is a single-user personal finance projection tool. It runs as a local web application — a TypeScript backend serving a React frontend. Data is stored in JSON files on the server filesystem. There is no database, no authentication, and no third-party integrations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React with TypeScript |
| Backend | Node.js with Express and TypeScript |
| Charts | Recharts |
| Data | JSON files on local filesystem |
| Build | Vite (frontend), ts-node or tsx (backend) |

## Project Structure

```
vizor/
├── server/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── routes/
│   │   │   ├── scenarios.ts      # CRUD for scenario files
│   │   │   └── defaults.ts       # Read/update defaults
│   │   ├── engine/
│   │   │   ├── calculator.ts     # Main calculation engine
│   │   │   ├── models/           # Per-model-type calculation logic
│   │   │   │   ├── salary.ts
│   │   │   │   ├── recurringExpense.ts
│   │   │   │   ├── onetimeExpense.ts
│   │   │   │   ├── onetimeIncome.ts
│   │   │   │   ├── mortgage.ts
│   │   │   │   ├── carLoan.ts
│   │   │   │   ├── retirementAccount.ts
│   │   │   │   └── socialSecurity.ts
│   │   │   └── types.ts          # Calculation output types
│   │   └── data/
│   │       └── fileStore.ts      # JSON file read/write utilities
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Dashboard/        # Main layout and navigation
│   │   │   ├── ModelForms/       # One form component per model template
│   │   │   ├── Charts/           # Line chart, stacked bar chart, overlay chart
│   │   │   ├── ScenarioManager/  # Scenario list, create, duplicate, compare
│   │   │   └── DataTable/        # Tabular detail/export view
│   │   ├── hooks/                # Data fetching, scenario state
│   │   ├── types/                # Shared TypeScript types (mirrored from server)
│   │   └── utils/                # Formatters, helpers
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   ├── defaults.json             # Global defaults (CPI, typical costs, etc.)
│   └── scenarios/                # One .json file per scenario
│       └── baseline.json         # Example/starter scenario
├── docs/                         # These spec documents
│   ├── ARCHITECTURE.md
│   ├── DATA_MODELS.md
│   ├── CALCULATION_ENGINE.md
│   ├── UI_SPEC.md
│   └── TASKS.md
├── package.json                  # Workspace root (monorepo)
└── README.md
```

## Data Flow

```
[JSON files on disk]
        │
        ▼
[Express API]  ←→  [File Store: read/write JSON]
        │
        ▼
[Calculation Engine: scenario JSON → yearly output arrays]
        │
        ▼
[REST API response]
        │
        ▼
[React Frontend: renders charts, forms, tables]
```

### Request/Response Pattern

1. Frontend requests a scenario via `GET /api/scenarios/:name`
2. Backend reads the scenario JSON file from `data/scenarios/`
3. Backend passes the scenario through the calculation engine
4. Backend returns both the raw scenario (for editing) and the calculated output (for display)
5. Frontend renders charts from the calculated output and forms from the raw scenario
6. When the user edits a model, frontend sends `PUT /api/scenarios/:name` with the updated scenario
7. Backend writes the updated JSON and returns recalculated output

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/defaults` | Return defaults.json |
| PUT | `/api/defaults` | Update defaults.json |
| GET | `/api/scenarios` | List all scenario names |
| GET | `/api/scenarios/:name` | Return scenario + calculated output |
| POST | `/api/scenarios` | Create new scenario |
| PUT | `/api/scenarios/:name` | Update scenario, return recalculated output |
| DELETE | `/api/scenarios/:name` | Delete scenario |
| POST | `/api/scenarios/:name/duplicate` | Duplicate a scenario |
| GET | `/api/scenarios/compare?names=a,b,c` | Return calculated output for multiple scenarios |

## Key Design Decisions

- **Calculation happens server-side.** The engine runs on the backend so the frontend stays simple and the logic is testable independently.
- **JSON files, not a database.** Files are stored in `data/`. This keeps the app simple and the data human-readable/editable.
- **Monorepo with shared types.** TypeScript types for models and calculation output are defined once and shared between server and client.
- **Charts are the primary view.** The UI leads with charts; the data table is a secondary drill-down/export feature.
- **CPI auto-inflation by default.** Every model that has an increase rate defaults to the global CPI rate from `defaults.json`. Users override per-model.
