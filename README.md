# Vizor

Vizor is a personal finance projection tool. It lets you build financial scenarios with income, expense, loan, retirement, and social security models, then visualizes projected cash flow over time through interactive charts and data tables.

## Prerequisites

- Node.js 18+ (tested with Node 22)
- npm 9+

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd vizor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```

   This starts:
   - **Backend** (Express) on http://localhost:3001
   - **Frontend** (Vite + React) on http://localhost:5173

4. Open http://localhost:5173 in your browser.

## Project Structure

```
vizor/
├── server/          # Express backend (TypeScript)
│   └── src/
│       ├── routes/      # API route handlers
│       ├── engine/      # Calculation engine
│       └── data/        # JSON file store
├── client/          # React frontend (Vite + TypeScript)
│   └── src/
│       ├── components/  # UI components
│       ├── types/       # TypeScript interfaces
│       └── utils/       # Formatting helpers
├── data/            # JSON data files
│   ├── defaults.json    # Global default values
│   └── scenarios/       # Scenario files
└── docs/            # Specification documents
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and client in development mode |
| `npm run dev:server` | Start only the backend server |
| `npm run dev:client` | Start only the frontend dev server |
| `npm test` | Run the server-side test suite |

## Data Storage

All data is stored as JSON files in the `data/` directory. Scenarios are saved in `data/scenarios/` and global defaults in `data/defaults.json`. No database is required.

## Tech Stack

- **Frontend:** React 19, TypeScript, Recharts, Vite
- **Backend:** Node.js, Express, TypeScript
- **Testing:** Vitest
